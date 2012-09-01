var SearchBuilder = function() {
	var options;
	
	this.setOptions = function(options) {
		this.options = options;
	}

	this.build = function() {
		var query = {};
		$.each(this.options, function() {
			var option = this;
			for(prop in option) {
				if(!isArray(option[prop]))
					query[prop] = option[prop];
				else {
					var arrayOpt = new Array;
					for(i in option[prop]) {
						var val = option[prop][i];
						if(val.constructor.toString().match(/String/i))
							val = '"' + val + '"';
						arrayOpt.push(val);
					}
					query[prop] = "[" + arrayOpt.join() + "]";
				}
				
			}
		});
		
		return query;
	}
	
	this.clear = function() {
		searchQuery = new SearchBuilder();
	}
}