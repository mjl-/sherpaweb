package sherpa

// Doc represents documentation about a Sherpa API, as returned by the "_docs" function.
type Doc struct {
	Title     string         `json:"title"`     // Name of an API section.
	Text      string         `json:"text"`      // Explanation of the API in markdown.
	Functions []*FunctionDoc `json:"functions"` // Documentation for each function exported in this API.
	Sections  []*Doc         `json:"sections"`  // Subsections, each with their own documentation.
}

// FunctionDoc contains the documentation for a single function.
// Text should be in markdown. The first line should be a synopsis showing parameters including types, and the return types.
type FunctionDoc struct {
	Name string `json:"name"` // Name of the function.
	Text string `json:"text"` // Markdown, describing the function, its parameters, return types and possible errors.
}
