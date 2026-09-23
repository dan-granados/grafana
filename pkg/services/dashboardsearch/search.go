package dashboardsearch

import (
	"database/sql"
	"net/http"
)

// Owner is a dashboard owner.
type Owner struct {
	Email string
}

// Search returns dashboard rows for the owner and title query on the request.
func Search(db *sql.DB, r *http.Request, owners map[string]*Owner) (*sql.Rows, error) {
	name := r.URL.Query().Get("owner")
	owner := owners[name]
	q := r.URL.Query().Get("q")
	query := "SELECT uid, title FROM dashboard WHERE email = '" + owner.Email + "' AND title LIKE '%" + q + "%'"
	return db.Query(query)
}
