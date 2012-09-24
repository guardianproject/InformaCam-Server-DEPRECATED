function handleMulticast(data) {
	console.info(data);
	if(data.attempt) {
		switch(data.attempt) {
			case Command.UPDATE_DERIVATIVES:
				var entityId = data.entity._id;
				if(entity._id == entityId) {
					entity.refresh(
						data.entity._rev,
						data.entity.discussions,
						data.entity.messages
					);
				}
				break;
		}
	}
}

function handleDesktopServiceMessage(data) {
	if(data.command) {
		switch(data.command) {
			case Command.VIEW_DERIVATIVES:
				Media.getAll.callback(data.metadata, $("#ui_submissions"));
				break;
			case Command.CHOOSE_MEDIA:
				if(data.metadata != null) {
					removeSpinner();
					showPopup(
						Submissions.CHOOSER_TITLE,
						formatSubmissionMini(data.metadata)
					);
				} else {
					var opts = [
						{
							label: Alert_STR.Basic.OK,
							action: removeAlert()
						}
					];
					showAlert(Alert_STR.Submissions.MAIN_TITLE, Alert_STR.Submissions.NO_NEW_SUBMISSIONS, true, null, opts);
				}
				break;
			case Command.LOAD_MEDIA:
				if(data.metadata != null) {
					if(!isEmptyObject(data.metadata)) {
						Media.load.callback(data.metadata);
						placeMedia();
					}
				} else {
					console.info("MEDIA IS NULL");
					var opts = [
						{
							label: Alert_STR.Basic.YES, 
							action: media.displayOnScreen()
						},
						{
							label: Alert_STR.Basic.No, 
							action: removeAlert()
						}
					];
					showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.NO_METADATA, true, null, opts);
				}
					
				break;
			case Command.SEARCH:
				if(data.metadata != null) {
					Search.query.callback(data.metadata);
				}
				break;
			case Command.ATTEMPT_LOGIN:
				removeSpinner();
				if(data.metadata != null)
					User.loadSession(data.metadata);
				else {
					currentUser = null;
					showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.LOGIN_FAILURE, false, null, null);
				}
				break;
			case Command.LOGOUT:
				removeSpinner();
				User.unloadSession();
				break;
			case Command.RENAME_MEDIA:
				removeSpinner();
				if(data.metadata != null)
					Media.rename.callback(data.metadata);
				break;
			case Command.SAVE_SEARCH:
				removeSpinner();
				if(data.metadata != null) {
					console.info(data.metadata);
					Search.saveSearch.callback(data.metadata);
					
				}
				break;
			case Command.APPEND_TO_ANNOTATION:
				removeSpinner();
				if(data.metadata != null)
					Media.appendToAnnotation.callback(data.metadata);
				break;
		}
	}
}

function broadcast(obj) {
	cometd.publish(dc, obj);
}

function multicast(obj) {
	cometd.publish(mcast, obj);
}

function isEmptyObject(obj) {
	return Object.keys(obj).length === 0;
}