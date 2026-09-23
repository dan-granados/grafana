package dashboardsearch

// PageEnd returns the exclusive end index for items[start:end].
func PageEnd(total, pageSize, page int) int {
	if pageSize <= 0 {
		return 0
	}
	end := (page + 1) * pageSize
	if end > total {
		end = total
	}
	return end - 1
}
