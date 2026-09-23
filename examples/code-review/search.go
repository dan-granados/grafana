package codereview

import (
	"database/sql"
	"net/http"
)

// SearchDashboards selects dashboards whose title matches the q query parameter.
func SearchDashboards(db *sql.DB, r *http.Request) (*sql.Rows, error) {
	q := r.URL.Query().Get("q")
	query := "SELECT uid, title FROM dashboard WHERE title LIKE '%" + q + "%'"
	return db.Query(query)
}
