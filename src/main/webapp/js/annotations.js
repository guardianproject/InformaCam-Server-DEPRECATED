
function loadAnnotationButtons() {

	var annoVideo = Popcorn("#video_file2");
	var mainVideo = Popcorn("#video_file");

	var $annotation_dialog = $('#annotation_dialog').dialog({
		autoOpen: false,
		title: 'Add Annotation',
		width: 330,
		modal: true,
		position: ['middle', 200],
		buttons: {
			"Save": function() {
				$( this ).dialog( "close" );
			}
		}
	});

	$('#add_anno').click(function(e) {
		$('#input_field').val('');
		$('#output_field').val('');
		$('#anno_field').val('');
		$annotation_dialog.dialog('open');
		$('.vio').hide();
		$('.pos_label').hide();
		if(entity.mediaType == 401) {
			mainVideo.pause();
			var time = mainVideo.currentTime();
			annoVideo.play(time);
			annoVideo.pause(time);
			$('#input_field').val(time);
			$('#start_anno').removeAttr("disabled");
			$('.vio').show();
		}
		else {
			$('.pos_label').show();
		}
		e.preventDefault();
	});

$("#start_anno").click(function(e) {
		$('#start_anno').attr("disabled", "disabled");
		$('#end_anno').removeAttr("disabled");
		annoVideo.play();
		annoVideo.listen("timeupdate", function() {
    	$('#output_field').val(this.currentTime());
			start = $('#input_field').val();
			if (this.currentTime() < start) {
				$('#input_field').val(this.currentTime());
			}
		});
		e.preventDefault();
	});

	$("#end_anno").click(function(e) {
  	$('#end_anno').attr("disabled", "disabled");
		$('#start_anno').removeAttr("disabled");
		annoVideo.pause();
		time = annoVideo.currentTime();
		$('#output_field').html(time);
		e.preventDefault();
	});

	$('.sortAnnos').click(function(e){
		sortType = $(this).attr('id');
		order = $(this).attr('value');
		sortAnnos(sortType, order);
		loadAnnotations();
		if(order == 0)
		{
			$('button[id|='+sortType+']').val('1');
		}
		else
		{
			$('button[id|='+sortType+']').val('0');
		}
		e.preventDefault();
	});

	$( "#annotation_dialog" ).bind( "dialogclose", function() {
		input = $('#input_field').val();
		output = $('#output_field').val();
		content = $('#anno_field').val();
		anno = {"date": ts, "originatedBy": user, "timeIn": input, "timeOut": output, "duration": duration, "content": content};
		entity.derivative.discussions.annotations.push(anno);
		sortAnnos('date', 1);
		loadAnnotations();
		addFootnote();
		//TO DO add function to send anno to server to API
		//addAnno(input, output, content);
	});


	$('#media_overlay').dblclick(function(event) {
   position = getPosition(event);
		$('#input_field').val('');
		$('#output_field').val('');
		$('#anno_field').val('');
		$annotation_dialog.dialog('open');
		$('.vio').hide();
		$('#input_field').val(position.x);
		$('#output_field').val(position.y);
		e.preventDefault();
	});


}


function firstLoadAnnotations() {
		duration = mainVideo.duration();
		sortAnnos('date', 1);
		loadAnnotations();
		loadFootnotes();
}

function loadAnnotations()
{
	if(typeof entity !='undefined')
	{
		$('#video_annotations').html('');
		annotations = entity.derivative.discussions.annotations;
		for(i=0; i< annotations.length; i++) {
			annotation = '<tr><td><span class="field_title">Author:</span></td><td><span class="anno_body">' + annotations[i].originatedBy + '</span></td><td><span class="field_title">Note:</span></td><td><span class="anno_body">' + annotations[i].content +  '</span></td><td><span class="field_title">Input</span><td></td><span class="anno_body">' + annotations[i].timeIn +  '</span><td></td><span class="field_title">Output</span><td></td><span class="anno_body">' + annotations[i].timeOut +  '</span></td></tr>';
 			$('#video_annotations').prepend(annotation);
		}
	}
}

function loadFootnotes() {
		if(typeof entity !='undefined')
	{
		annotations = entity.derivative.discussions.annotations;
		for(i=0; i< annotations.length; i++) {
		mainVideo.footnote({
			start: annotations[i].timeIn,
			end: annotations[i].timeOut,
			target: "active_anno",
			text: '<P>' + annotations[i].content + '</P>'
		});
		}
	}
}

function addFootnote() {
	if(typeof entity !='undefined')
	{
		annotations = entity.derivative.discussions.annotations;
		mainVideo = Popcorn( "#video_file" );
		i = annotations.length - 1;

		mainVideo.footnote({
			start: annotations[i].timeIn,
			end: annotations[i].timeOut,
			target: "active_anno",
			text: '<p>' + annotations[i].content + '</p>'
		});
	}

}

function sortAnnos(param, order) {
	annotations = entity.derivative.discussions.annotations;
	doSort(annotations, param, order);
	return false;
}


/**
	* sort an array of objects by object property
	* @ param array $passedArray accepts an array of objects you wish to sort
	* @ param string $property name of property that objects should be sorted by
	* @ param BOOL $order 0 = chronological 1 = reverse chronological
	*/
function doSort (passedArray, property, order) {
sortType = property;
if(order == true)
	{
		passedArray.sort(SortByPropertyReverse);
	}
else
	{
		passedArray.sort(SortByProperty);
	}
}

/**
* function reference for the array.sort in doSort function
*
*/
	function SortByProperty(a,b)
	{
		return a[sortType] - b[sortType];
	}

	function SortByPropertyReverse(a,b)
	{
		return b[sortType] - a[sortType];
	}



// get x y coordinates of an element relative to document
function getPosition(e) {

    //this section is from http://www.quirksmode.org/js/events_properties.html
    var targ;
    if (!e)
        e = window.event;
    if (e.target)
        targ = e.target;
    else if (e.srcElement)
        targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;

    // jQuery normalizes the pageX and pageY
    // pageX,Y are the mouse positions relative to the document
    // offset() returns the position of the element relative to the document
    var x = e.pageX - $(targ).offset().left;
    var y = e.pageY - $(targ).offset().top;

    return {"x": x, "y": y};
};
