function formatUnaliasedTitle(sourceId, mediaType) {
	return MediaTypes.UnaliasedTitle[mediaType] + sourceId;
}

function formatSavedSearchesForList() {
	var content = $(document.createElement('table')).prop('width','100%');
	
	$.each(currentUser.savedSearches, function(index, item) {
		var s = item;
		var idx = index;
		var paramString = "";
		
		if(s.parameters.keywords != null)
			paramString += (
				Search_STR.SavedSearches.Fields.Keywords + ": " +
				s.parameters.keywords.join(", ") + "<br />");
		
		if(s.parameters.mediaType != null)
			paramString += (
				Search_STR.SavedSearches.Fields.MediaType + ": " +
				MediaTypes.Names[s.parameters.mediaType] + "<br />");
				
		if(s.parameters.timeframe != null)
			paramString += (
				Search_STR.SavedSearches.Fields.Timeframe + ": " +
				SearchParameters.Timeframe.Names[s.parameters.timeframe] + "<br />");
		
		
		var row = $(document.createElement('tr'));
		row.append(
			$(document.createElement('td'))
				.html(s.alias)
				.prop('width','30%')
		);
		row.append(
			$(document.createElement('td'))
				.html(paramString)
				.prop('width','70%')
		);
		row.click(function() {
			Search.loadSearch(idx);
		});
		
		content.append(row);
	});
	
	return content;
}

function parseForReplacementMetadata(item) {
	var mod = '<h3>' + item + '</h3>';
	
	if(typeof item != "string") {
		var keyword;
		var keywordStart = item[0].indexOf("%=");
		
		if(keywordStart != -1) {
			keyword = item[0].substring(keywordStart);
			
			var keywordEnd = keyword.indexOf(" ");
			
			if(keywordEnd == -1) {
				keywordEnd = keyword.indexOf(")");
			}
			
			if(keywordEnd == -1) {
				keywordEnd = keyword.indexOf(".");
			}
			
			if(keywordEnd != -1)
				keyword = keyword.substring(0, keywordEnd);
				
			mod = item[0].replace(keyword, '<a href="#details/' + keyword.substring(2) + '/' + encodeURIComponent(item[1]) + '">' + item[1] + '</a>');
		} else
			mod = item[1];
	}
	
	return mod;
}

function formatSubmissionsForTable(data) {
	var obj = new Array();
	$.each(data, function() {
		var d = this;
		var alias = d.alias;
		
		if(alias == undefined)
			alias = formatUnaliasedTitle(d.sourceId, d.mediaType);
		
		var row = $(document.createElement('tr'))
			.append(
				$(document.createElement('td'))
					.html("<b>" + alias + "</b>")
					.attr({
						'class': 'ic_toMedia',
						'id': d._id
					})
			)
			.append(
				$(document.createElement('td'))
					.html(MediaTypes.Names[d.mediaType])
			)
			.append(
				$(document.createElement('td'))
					.html(d.dateCreated ? formatTimestampForHumans(d.dateCreated) : Derivative_STR.Fields.N_A)
			)
			.append(
				$(document.createElement('td'))
					.html(d.sourceId ? d.sourceId : Derivative_STR.Fields.UNKNOWN)
			)
			
		obj.push(row);
	});
	return obj;
}

function formatTimestampForHumans(ts) {
	var date = new Date(ts);
	return date.getDate() + " " + TimeAndDate_STR.Months.SHORT[date.getMonth()] + " " + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes();
}