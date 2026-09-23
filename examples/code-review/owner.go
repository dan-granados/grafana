package codereview

// Owner is a dashboard owner.
type Owner struct {
	Email string
}

// OwnerEmail returns the email address for name.
func OwnerEmail(owners map[string]*Owner, name string) string {
	owner := owners[name]
	return owner.Email
}
