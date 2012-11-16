function formatUnaliasedTitle(sourceId, mediaType) {
	return MediaTypes.UnaliasedTitle[mediaType] + sourceId;
}

function formatSearchResultsForList(searchResults) {
	var content = $(document.createElement('ol'));
	$("#num_search_results").html(searchResults.length);
	$.each(searchResults, function(index, item) {
		var res = item;
		var idx = index;
		
		var title = res.alias;
		if(title == undefined || title == null)
			title = formatUnaliasedTitle(res.sourceId, res.mediaType);
		
		var table  = $(document.createElement('table'))
			.append(
				$(document.createElement('tr'))
					.append(
						$(document.createElement('td'))
							.prop('width','20%')
							.append(
								$(document.createElement('img'))
									.prop('src','images/ic_logo.png')
							)
					)
					.append(
						$(document.createElement('td'))
							.html(
								title + "<br />" + 
								formatTimestampForHumans(res.dateCreated)
							)
							.attr({
								'class':'ic_toMedia',
								'id':res._id
							})
					)
			);
		content.append($(document.createElement('li')).append(table));
	});
	
	return content;
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

function secondsToMillis(sec) {
	return sec * 1000;
}

function millisToSeconds(millis) {
	return millis/1000;
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

function formatClientListForTable(data) {
	var obj = new Array();
	$.each(data, function(idx, item) {
		
		var d = item;
		var alias = d.alias;
		
		if(alias == undefined)
			alias = d.sourceId;
		
		var export_ictd = $(document.createElement('a'))
			.html(Source_STR.EXPORT_PROMPT)
			.click(function() {
				Admin.downloadClientCredentials.init(d.sourceId);
			});
			
		var row = $(document.createElement('tr'))
			.append(
				$(document.createElement('td'))
					.html("<b>" + alias + "</b>")
					.attr({
						'class': 'ic_toSource',
						'id': d.sourceId
					})
			)
			.append(
				$(document.createElement('td'))
					.html(d.numberOfSubmissions)
			)
			.append(
				$(document.createElement('td'))
					.html(formatTimestampForHumans(d.dateOfLastSubmission))
			)
			.append(
				$(document.createElement('td'))
					.append(export_ictd)
			);
		
		obj.push(row);
				
	});
	return obj;
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