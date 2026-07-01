(() => {
  const suggestions = document.getElementById('suggestions');
  const search = document.getElementById('search');
  const searchForm = search ? search.closest('form') : null;

  if (!search || !suggestions || !window.FlexSearch) return;

  var index = new FlexSearch.Document({
    tokenize: "forward",
    cache: 100,
    document: {
      id: 'id',
      store: [
        "href", "title", "description"
      ],
      index: ["title", "description", "content"]
    }
  });


  // Not yet supported: https://github.com/nextapps-de/flexsearch#complex-documents

  /*
  var docs = [
    {{ range $index, $page := (where .Site.Pages "Section" "docs") -}}
      {
        id: {{ $index }},
        href: "{{ .Permalink }}",
        title: {{ .Title | jsonify }},
        description: {{ .Params.description | jsonify }},
        content: {{ .Content | jsonify }}
      },
    {{ end -}}
  ];
  */

  // https://discourse.gohugo.io/t/range-length-or-last-element/3803/2

  {{ $list := slice }}
  {{- if and (isset .Site.Params.options "searchsectionsindex") (not (eq (len .Site.Params.options.searchSectionsIndex) 0)) }}
  {{- if eq .Site.Params.options.searchSectionsIndex "ALL" }}
  {{- $list = .Site.Pages }}
  {{- else }}
  {{- $list = (where .Site.Pages "Type" "in" .Site.Params.options.searchSectionsIndex) }}
  {{- if (in .Site.Params.options.searchSectionsIndex "HomePage") }}
  {{ $list = $list | append .Site.Home }}
  {{- end }}
  {{- end }}
  {{- else }}
  {{- $list = (where .Site.Pages "Section" "docs") }}
  {{- end }}

  {{ $len := (len $list) -}}

  {{ range $index, $element := $list -}}
    index.add(
      {
        id: {{ $index }},
        href: "{{ .RelPermalink }}",
        title: {{ .Title | jsonify }},
        {{ with .Description -}}
          description: {{ . | plainify | truncate 180 | jsonify }},
        {{ else -}}
          description: {{ .Summary | plainify | truncate 180 | jsonify }},
        {{ end -}}
        content: {{ .Plain | jsonify }}
      }
    );
	  {{ end -}}

  function hideSuggestions() {
    suggestions.classList.add('d-none');
    suggestions.innerHTML = '';
  }

  const searchPlaceholder = search.getAttribute('placeholder') || '';

  function clearSearchPlaceholder() {
    search.setAttribute('placeholder', '');
  }

  function restoreSearchPlaceholder() {
    if (search.value.trim().length === 0) {
      search.setAttribute('placeholder', searchPlaceholder);
    }
  }

  function getFlatResults(searchQuery, maxResult) {
    const results = index.search(searchQuery, { limit: maxResult, enrich: true });
    const flatResults = new Map();

    for (const result of results.flatMap((field) => field.result)) {
      if (!flatResults.has(result.doc.href)) {
        flatResults.set(result.doc.href, result.doc);
      }
    }

    return flatResults;
  }

  function renderNoResults(searchQuery) {
    const noResultsMessage = document.createElement('div');
    noResultsMessage.classList.add('suggestion__no-results');
    noResultsMessage.append('No results for ');

    const query = document.createElement('strong');
    query.textContent = searchQuery;
    noResultsMessage.append(query);

    suggestions.appendChild(noResultsMessage);
  }

  function renderResult(doc) {
    const entry = document.createElement('div');
    const link = document.createElement('a');
    const title = document.createElement('span');
    const description = document.createElement('span');

    link.href = doc.href;
    title.textContent = doc.title;
    title.classList.add('suggestion__title');
    description.textContent = doc.description;
    description.classList.add('suggestion__description');

    link.append(title, description);
    entry.appendChild(link);
    suggestions.appendChild(entry);
  }

  function showResults() {
    const maxResult = 8;
    const searchQuery = search.value.trim();

    suggestions.innerHTML = '';

    if (searchQuery.length < 2) {
      hideSuggestions();
      return;
    }

    const flatResults = getFlatResults(searchQuery, maxResult);
    suggestions.classList.remove('d-none');

    if (flatResults.size === 0) {
      renderNoResults(searchQuery);
      return;
    }

    for (const doc of flatResults.values()) {
      renderResult(doc);
      if (suggestions.childElementCount === maxResult) break;
    }
  }

  function focusSearch(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      search.focus();
    }

    if (e.key === 'Escape') {
      search.blur();
      hideSuggestions();
    }
  }

  function focusSuggestion(e) {
    if (suggestions.classList.contains('d-none')) return;

    const focusableSuggestions = [...suggestions.querySelectorAll('a')];
    if (focusableSuggestions.length === 0) return;

    const currentIndex = focusableSuggestions.indexOf(document.activeElement);

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusableSuggestions[Math.max(currentIndex - 1, 0)].focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusableSuggestions[Math.min(currentIndex + 1, focusableSuggestions.length - 1)].focus();
    }
  }

  search.addEventListener('input', showResults, true);
  search.addEventListener('focus', () => {
    clearSearchPlaceholder();
    showResults();
  }, true);
  search.addEventListener('blur', restoreSearchPlaceholder, true);

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const firstResult = suggestions.querySelector('a');
      if (firstResult) {
        window.location.href = firstResult.href;
      }
    });
  }

  document.addEventListener('keydown', focusSearch);
  document.addEventListener('keydown', focusSuggestion);
  document.addEventListener('click', (event) => {
    if (!searchForm || searchForm.contains(event.target)) return;
    hideSuggestions();
  });
})();
