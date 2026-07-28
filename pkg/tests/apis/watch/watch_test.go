package watch

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/watch"

	"github.com/grafana/grafana/pkg/tests/apis"
	"github.com/grafana/grafana/pkg/tests/testinfra"
	"github.com/grafana/grafana/pkg/tests/testsuite"
	"github.com/grafana/grafana/pkg/util/testutil"
)

func TestMain(m *testing.M) {
	testsuite.Run(m)
}

var gvr = schema.GroupVersionResource{
	Group:    "playlist.grafana.app",
	Version:  "v1",
	Resource: "playlists",
}

// newClient starts Grafana with the KV backend (the one that can replay events)
// and returns a playlists client.
func newClient(t *testing.T) *apis.K8sResourceClient {
	t.Helper()
	helper := apis.NewK8sTestHelper(t, testinfra.GrafanaOpts{
		AppModeProduction:  true,
		DisableAnonymous:   true,
		EnableSQLKVBackend: true,
	})
	return helper.GetResourceClient(apis.ResourceClientArgs{
		User: helper.Org1.Admin,
		GVR:  gvr,
	})
}

func createPlaylist(t *testing.T, client *apis.K8sResourceClient, name string) *unstructured.Unstructured {
	t.Helper()
	created, err := client.Resource.Create(context.Background(), &unstructured.Unstructured{
		Object: map[string]any{
			"apiVersion": gvr.GroupVersion().String(),
			"kind":       "Playlist",
			"metadata":   map[string]any{"name": name},
			"spec": map[string]any{
				"title":    name,
				"interval": "5m",
				"items":    []any{},
			},
		},
	}, metav1.CreateOptions{})
	require.NoError(t, err)
	return created
}

// TestIntegrationWatchResumesFromResourceVersion checks that a watch resuming
// from a resource version gets the writes that happened while it was
// disconnected, including the ones that no longer fit in the server's in-memory
// broadcaster cache. More writes than the cache can hold (500) happen while the
// client is away, so the oldest ones can only come from the event store.
func TestIntegrationWatchResumesFromResourceVersion(t *testing.T) {
	testutil.SkipIntegrationTestInShortMode(t)
	client := newClient(t)
	ctx := context.Background()

	list, err := client.Resource.List(ctx, metav1.ListOptions{})
	require.NoError(t, err)
	resumeFrom := list.GetResourceVersion()

	// Writes that happen while the client is "disconnected". The first one is
	// the interesting one: by the end it has been evicted from the cache.
	const writes = 550
	for i := range writes {
		createPlaylist(t, client, fmt.Sprintf("missed-%03d", i))
	}

	// Let the broadcaster observe every write, so the early ones are evicted
	// from its 500 entry replay cache.
	time.Sleep(6 * time.Second)

	w, err := client.Resource.Watch(ctx, metav1.ListOptions{ResourceVersion: resumeFrom})
	require.NoError(t, err)
	defer w.Stop()

	// The very first write must still be delivered, and it must be the first
	// event we see: watch events are ordered by resource version.
	select {
	case evt, ok := <-w.ResultChan():
		require.True(t, ok, "watch closed before delivering any event")
		require.NotEqual(t, watch.Error, evt.Type, "unexpected error event: %v", evt.Object)
		obj, ok := evt.Object.(*unstructured.Unstructured)
		require.True(t, ok, "unexpected object type %T", evt.Object)
		require.Equal(t, "missed-000", obj.GetName(), "the oldest missed write was skipped")
	case <-time.After(30 * time.Second):
		t.Fatal("timed out waiting for the events missed while disconnected")
	}
}
