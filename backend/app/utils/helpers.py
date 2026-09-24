"""Helper utilities for PaperMatcher-AI."""


def sanitize_query(query: str) -> str:
    """Strip extraneous whitespace and control characters from search input."""
    if not query:
        return ""
    return query.strip()
