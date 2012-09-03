var MediaEntity = function(data) {
	this._id = data._id;
	this._rev = data._rev;
	
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
	
	if(data.discussions != undefined)
		this.derivative.discussions = data.discussions;
	if(data.messages != undefined)
		this.derivative.messages = data.messages;
		
	this.options = new Array();
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
}