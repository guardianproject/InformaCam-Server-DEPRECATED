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
					// do stuff with the search results
					Search.query.callback(data.metadata);
				}
				break;
			case Command.ATTEMPT_LOGIN:
				removeSpinner();
				if(data.metadata != null)
					User.loadSession(data.metadata);
				else {
					showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.LOGIN_FAILURE, false, null, null);
				}
				break;
		}
	}
}

function broadcast(obj) {
	cometd.publish(dc, obj);
}

function isEmptyObject(obj) {
	return Object.keys(obj).length === 0;
}