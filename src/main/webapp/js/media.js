var InformaRegion = function(left, top, right, bottom, discussionId, isNew) {
	mcx.lineWidth = 2;
	this.bounds = {
		left: left,
		top: top,
		bottom: bottom,
		right: right,
		width: Math.abs(left - right),
		height: Math.abs(top - bottom)
	};
	
	this.container = $(document.createElement('div')).attr({
		'class':'mcxDiv',
		'id':'mcx_' + discussionId
	});
	
	$(this.container).click(function() {
		var r = entity.getActiveRegion(this);
		$.each(entity.regions, function() {
			if(this != r) {
				this.isSelected = false;
				this.isActive = false;
			} else {
				this.isSelected = true;
				this.isActive = true;
			}
			this.update();
		});
		showAnnotationHolder();
		entity.loadAnnotation(r.discussionId);
	});
	
	$(this.container).mouseenter(function() {
		var r = entity.getActiveRegion(this);
		r.isSelected = true;
		r.update();
	});
	
	$(this.container).mouseout(function() {
		var r = entity.getActiveRegion(this);
		r.isSelected = false;
		r.update();
	});
	
	$("#media_overlay").before($(this.container));
	
	this.isNew = isNew;
	this.discussionId = discussionId;
	this.isActive = false;
	this.isSelected = false;
	
	this.update = function() {
		mcx.clearRect(this.bounds.left, this.bounds.top, this.bounds.height, this.bounds.width);
		
		if(this.isSelected) {
			mcx.strokeStyle = Styles.Color.ACTIVE;
		} else {
			if(!this.isActive)
				mcx.strokeStyle = Styles.Color.INACTIVE;
		}
		
		mcx.strokeRect(
			this.bounds.left,
			this.bounds.top,
			this.bounds.height,
			this.bounds.width
		);
		
		$(this.container).css({
			'width' : this.bounds.width,
			'height': this.bounds.height,
			'top': this.bounds.top,
			'left': this.bounds.left,
			'margin-left': entity.margLeft,
			'margin-top': $("#media_overlay").position().top
		});
		
	};
	
	this.update();
}

var MediaEntity = function(data) {
	this._id = data._id;
	this._rev = data._rev;
	
	this.regions = new Array();
	this.getActiveRegion = function(r) {
		return entity.regions[$(r).attr('id').split("mcx_")[1]];
	}

	if(data.alias == undefined)
		this.title = formatUnaliasedTitle(data.sourceId, data.mediaType);
	else
		this.title = data.alias;

	this.dateCreated = data.dateCreated;
	this.sourceId = data.sourceId;
	this.mediaType = data.mediaType;
	this.imageDimensions = [data.j3m.data.exif.imageLength, data.j3m.data.exif.imageWidth];

	this.derivative = {
		dateSavedAsDerivative: data.timestampIndexed,
		representation: data.representation,
		j3m: data.j3m,
		discussions: new Array(),
		messages: new Array(),
		keywords: data.keywords
	}

	this.setAlias = function() {
		Media.rename.prompt();
	};
	
	this.refresh = function(_rev, discussions, messages) {
		entity._rev = _rev;
		entity.derivative.discussions = discussions;
		entity.derivative.messages = messages;
		
		if(entity.currentAnnotation != null && entity.currentAnnotation != undefined)
			entity.reloadAnnotation(entity.currentAnnotation);
	}
	
	this.reloadAnnotation = function(annotationId) {
		$("#annotation_content").empty();
		entity.loadAnnotation(annotationId);
	}
	
	this.loadAnnotation = function(annotation) {
		$("#annotation_append_submit").unbind();
		var a = entity.derivative.discussions[annotation].annotations;
		var aList = $(document.createElement('ol')).attr('class','annotation_list');
		$.each(a, function() {
			
			console.info(this);
			var aListItem = $(document.createElement('li'))
				.append(
					$(document.createElement('p')).attr('class','date')
						.html(formatTimestampForHumans(this.date))
				)
				.append(
					$(document.createElement('p')).html(this.content)
				);
			aList.append(aListItem);
		});
		$("#annotation_content").append(aList);
		$("#annotation_append_submit").bind('click', function() {
			Media.appendToAnnotation.init(annotation);
		});
		entity.currentAnnotation = annotation;
	};

	if(data.discussions != undefined)
		this.derivative.discussions = data.discussions;
	if(data.messages != undefined)
		this.derivative.messages = data.messages;

	this.options = new Array();

	this.options.push(
		{
			label: Menu_STR.Media.RENAME,
			action: function() {
				entity.setAlias();
			}
		}
	);

	switch(this.mediaType) {
		case MediaTypes.IMAGE:
			this.options.push(
				{
					label: Menu_STR.Media.Image.SHARE_IMAGE,
					action: function() {
						entity.shareMedia();
					}
				}
			);
			break;
		case MediaTypes.VIDEO:
			this.options.push(
				{
					label: Menu_STR.Media.Video.SHARE_VIDEO,
					action: function() {
						entity.shareMedia();
					}
				}
			);
			break;
	}

	this.options.push({
		label: Menu_STR.Media.EXPORT_METADATA,
		action: function() {
			entity.exportMetadata();
		}
	});

	this.options.push({
		label: Menu_STR.Media.SEND_MESSAGE,
		action: function() {
			entity.sendMessage();
		}
	});

	this.visualize = function(type) {
		switch(type) {
			case View.NORMAL:
				toggleValue($("#metadata_readout").get(0));
				break;
			case View.MAP:
				toggleValue($("#map_view_readout").get(0));
				break;
			case View.MOTION:
				toggleValue($("#motion_view_readout").get(0));
				break;
			case View.NETWORK:
				toggleValue($("#network_view_readout").get(0));
				break;
		}
	};

	this.shareMedia = function() {
		alert("sharing media");
	};

	this.exportMetadata = function() {
		alert("exporting metadata");
	};

	this.sendMessage = function() {
		alert("view submission info");
	};

	this.informa = {
		intent: {
			label: Metadata_STR.Intent.label,
			loads: [
				[
					Metadata_STR.Intent.SUBMITTED_BY,
					this.derivative.j3m.intent.owner.publicKeyFingerprint
				],
				[
					Metadata_STR.Intent.OWNERSHIP_TYPE,
					OwnershipTypes.Names[this.derivative.j3m.intent.owner.ownershipType]
				]
			]
		},
		genealogy: {
			label: Metadata_STR.Genealogy.label,
			loads: [
				[
					Metadata_STR.Genealogy.DATE_CREATED,
					formatTimestampForHumans(this.derivative.j3m.genealogy.dateCreated)
				],
				[
					Metadata_STR.Genealogy.DATE_ACQUIRED,
					formatTimestampForHumans(this.derivative.j3m.genealogy.dateSavedAsInformaDocument)
				],
				Metadata_STR.Data.Device.label,
				[
					Metadata_STR.Data.Device.DEVICE_BLUETOOTH_NAME,
					this.derivative.j3m.genealogy.createdOnDevice.bluetoothName
				],
				[
					Metadata_STR.Data.Device.DEVICE_BLUETOOTH_ADDRESS,
					this.derivative.j3m.genealogy.createdOnDevice.bluetoothAddress
				],
				[
					Metadata_STR.Data.Device.DEVICE_IMEI,
					this.derivative.j3m.genealogy.createdOnDevice.imei
				],
				Metadata_STR.Data.Device.Integrity.label,
				[
					Metadata_STR.Data.Device.Integrity.RATING,
					100 		//TODO!
				]
			]
		}
	};

	this.visualize(View.NORMAL);
}