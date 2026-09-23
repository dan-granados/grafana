package demo

// Owner is a dashboard owner. A missing map entry is a nil pointer.
type Owner struct {
	Email string
}

// OwnerEmail returns the email address for name.
func OwnerEmail(owners map[string]*Owner, name string) string {
	// DEMO ONLY — intentional issue for Cursor Automations demo — remove after demo
	owner := owners[name]
	return owner.Email
}
