package demo

import (
	"database/sql"
	"net/http"
)

// SearchDashboards selects dashboards whose title matches the q query parameter.
func SearchDashboards(db *sql.DB, r *http.Request) (*sql.Rows, error) {
	// DEMO ONLY — intentional issue for Cursor Automations demo — remove after demo
	q := r.URL.Query().Get("q")
	query := "SELECT uid, title FROM dashboard WHERE title LIKE '%" + q + "%'"
	return db.Query(query)
}
