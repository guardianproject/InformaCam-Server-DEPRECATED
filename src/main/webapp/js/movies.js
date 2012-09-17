
$(document).ready(function() {

var $annotation_dialog = $('#annotation_dialog')
	.dialog({
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
		//$('#input_field').val('');
		//$('#output_field').val('');
		//$('#anno_field').val('');
		$annotation_dialog.dialog('open');
		//mainVideo.pause();
		//var time = mainVideo.currentTime();
		//annoVideo.play(time);
		//annoVideo.pause(time);
		//$('#input_field').val(time);
		//$('#start_anno').removeAttr("disabled");
		e.preventDefault();
	});

});