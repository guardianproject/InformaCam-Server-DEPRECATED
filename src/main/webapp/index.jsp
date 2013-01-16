<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <script type="text/javascript" src="js/string.js"></script>
    <script type="text/javascript" src="js/vars.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/jquery/jquery-1.7.1.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/jquery/json2.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/org/cometd.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/jquery/jquery.cometd.js"></script>
    <script type="text/javascript" src="js/application.js"></script>
    <script type="text/javascript" src="js/api.js"></script>
    <script type="text/javascript" src="js/formatter.js"></script>
    <script type="text/javascript" src="js/cors.js"></script>
    <script type="text/javascript">
        var config = {
            contextPath: '${pageContext.request.contextPath}'
        };
    </script>
    <script type="text/javascript" src="js/handlers.js"></script>
	<script type="text/javascript" src="js/sammy.js"></script>
	<script type="text/javascript" src="js/popcorn-complete.min.js"></script>
	<script type="text/javascript" src="js/ui.js"></script>
	<script type="text/javascript" src="js/media.js"></script>
	<script type="text/javascript" src="js/search.js"></script>
	<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDCQXtJ3fqhsPP2K3TUVI6kJhmJDCzVZOI&sensor=false"></script>
	<link rel="stylesheet" type="text/css" href="css/jquery-ui.1.8.23.custom.css" />
	<link rel="stylesheet" type="text/css" href="css/ic.css" />
	<link rel="stylesheet" type="text/css" href="css/annotations.css" />
    <title>InformaCam - powered by The Guardian Project</title>
</head>
<body>
	<div id="spinner_holder">
		<img src="images/spinner_gif.gif" />
	</div>
	<div id="alert_holder">
		<h1 id="alert_title"></h1>
		<div id="alert_text"></div>
		<div id="alert_options"></div>
	</div>

	<div id="popup_holder">
		<h1 id="popup_title"></h1>
		<div id="popup_content"></div>
	</div>
	
	<div id="importer_holder"></div>

	<div id="annotation_holder">
		<div id="annotation_controls">
			<span id="annotation_close" onclick="removeAnnotationHolder();">[x]</span>
			<span id="annotation_move">[&nbsp;&nbsp;&nbsp;]</span>
		</div>
		<h1>Annotations</h1>
		<div id="annotation_content"></div>
		<div id="annotation_append_holder">
			<table width="100%">
				<tr>
					<td width="85%"><input id="annotation_append_content" /></td>
					<td><a id="annotation_append_submit">Add</a></td>
				</tr>
			</table>
		</div>
	</div>

	<div id="messages_holder">
		<div id="messages_controls">
			<span id="messages_close" onclick="removeMessagesHolder();">[x]</span>
			<span id="messages_move">[&nbsp;&nbsp;&nbsp;]</span>
		</div>
		<h1>Messages</h1>
		<div id="messages_content"></div>
		<div id="messages_append_holder">
			<table width="100%">
				<tr>
					<td width="85%"><input id="messages_append_content" /></td>
					<td><a id="messages_append_submit">Send</a></td>
				</tr>
			</table>
		</div>
	</div>

	<div id="expandedView_holder">
		<div id="expandedView_controls">
			<span id="expandedView_close" onclick="removeExpandedViewHolder();">[x]</span>
			<span id="expandedView_move">[&nbsp;&nbsp;&nbsp;]</span>
		</div>
		<h1 id="expandedView_title">View Name</h1>
		<div id="expandedView_content">
			<div id="ev_map_holder">
				<div id="ev_map"></div>
			</div>
			<div id="ev_x">Here is something else...</div>
		</div>
	</div>

	<div id="ic_header">
		<div id="ic_logo">
			<table>
				<tr>
					<td><img src="images/ic_logo.png" /></td>
					<td>
						<h1>InformaCam</h1>
						<p>Powered by<br /><a href="#help/">The Guardian Project</a></p>
					</td>
				</tr>
			</table>
		</div>

		<ul id="ic_nav">
			<li><a href="#submissions/">
				<script type="text/javascript">
					document.write(Menu_STR.Main.SUBMISSIONS);
				</script>
			</a></li>
			<li><a href="#search/">
				<script type="text/javascript">
					document.write(Menu_STR.Main.SEARCH);
				</script>
			</a></li>
			<li><a href="#admin/">
				<script type="text/javascript">
					document.write(Menu_STR.Main.ADMIN);
				</script>
			</a></li>
			<li><a href="#help/">
				<script type="text/javascript">
					document.write(Menu_STR.Main.HELP);
				</script>
			</a></li>
		</ul>
	</div>

	<div id="ic_main">
		<div id="ui_media">
			<table class="ic_table">
				<tr>
					<td id="media_holder" width="60%">

						<div id="media_options">
							<ul class="ic_menu_button">
								<li>
									<a>Views</a>
									<div class="ic_dropdown">
										<ul id="views_menu">
											<li onclick="entity.visualize(View.NORMAL);">
												<script type="text/javascript">
													document.write(View_STR.NORMAL);
												</script>
											</li>
											<li onclick="entity.visualize(View.MAP);">
												<script type="text/javascript">
													document.write(View_STR.MAP);
												</script>
											</li>
											<li onclick="entity.visualize(View.MOTION);">
												<script type="text/javascript">
													document.write(View_STR.MOTION);
												</script>
											</li>
											<li onclick="entity.visualize(View.NETWORK);">
												<script type="text/javascript">
													document.write(View_STR.NETWORK);
												</script>
											</li>
										</ul>
									</div>
								</li>
								<li>
									<a>Options</a>
									<div class="ic_dropdown">
										<ul id="options_menu"></ul>
									</div>
								</li>
								<li>
									<a id="add_anno">Add Annotation</a>
								</li>
								<li class="ic_menu_buttonOverride">
									<span>ImageRegion Tracing: </span>
									<div class="ic_toggle" id="imageRegionView">
										<a id="irTracing_on" onclick="toggleValue(this);traceRegions();" rel="tracingOn" class="selected">
											<script type="text/javascript">
												document.write(ImageRegion_STR.ON);
											</script>
										</a><a id="irTracing_off" onclick="toggleValue(this);hideRegions();" rel="tracingOff">
											<script type="text/javascript">
												document.write(ImageRegion_STR.OFF);
											</script>
										</a>
									</div>
								</li>
							</ul>
						</div>
						<div id="media_frame">
							<div id="video_wrapper"><video id="video_holder" controls></video></div>
							<canvas id="media_overlay"></canvas>
						</div>


					</td>
					<td id="metadata_holder">
						<h2 id="media_title"></h2>
						<div id="visualization_holder">
							<div id="metadata_readout"></div>
							<div id="map_view_readout">
								<div id="map_view_map"></div>
								<div id="map_view_annotation_holder">
									<h2>
										<script type="text/javascript">
											document.write(Metadata_STR.Locations.LABEL);
										</script>
									</h2>
									<div id="map_view_annotations">here go annos</div>
								</div>
							</div>
							<div id="motion_view_readout">
								<span class="underConstruction">
									Motion View coming soon...
								</span>
							</div>
							<div id="network_view_readout">
								<span class="underConstruction">
									Network View coming soon...
								</span>
							</div>
						</div>

					</td>
				</tr>
			</table>
		</div>

		<div id="ui_submissions">
			<a class="ic_to_import" onclick="Media.doImport.init();">Import Media...</a><a class="ic_to_refresh" onclick="Media.getAll.init();">Refresh</a>
			<div id="submissions_holder">
				<table>
				<tr class="tr_header">
					<td id="submissions_filename">
						<script type="text/javascript">
							document.write(Derivative_STR.Fields.FILENAME);
						</script>
					</td>
					<td id="submissions_mediaType">
						<script type="text/javascript">
							document.write(Derivative_STR.Fields.MEDIA_TYPE);
						</script>
					</td>
					<td id="submissions_timeCreated">
						<script type="text/javascript">
							document.write(Derivative_STR.Fields.TIME_CREATED);
						</script>
					</td>
					<td id="submissions_submittedBy">
						<script type="text/javascript">
							document.write(Derivative_STR.Fields.SUBMITTED_BY);
						</script>
					</td>
				</tr>
			</table>
			</div>
		</div>

		<div id="ui_admin">
			<ul id="ic_admin_module_holder"></ul>
		</div>

		<div id="ui_help">
			<h1>help main</h1>
		</div>

		<div id="ui_details">
			<h1>details viewer</h1>
		</div>

		<div id="ui_search">
			<table class="ic_search ic_table">
				<tr>
					<td width="25%">
						<div id="search_refine_options">
							<div id="search_refine_actions">
								<a onclick="Search.query.init();">
									<script type="text/javascript">
										document.write(Search_STR.MAIN_TITLE);
									</script>
								</a>

								<a onclick="Search.clear();">
									<script type="text/javascript">
										document.write(Search_STR.RESET);
									</script>
								</a>

								<a onclick="Search.getSavedSearches();">
									<script type="text/javascript">
										document.write(Search_STR.By_Saved_Search.LABEL);
									</script>
								</a>
							</div>

							<h3 style="margin-top:10px;">
								<script type="text/javascript">
									document.write(Search_STR.By_Keyword.LABEL);
								</script>
							</h3>
							<input optionKey="keywords" id="keywords" type="text" class="ic_smallListInput" style="width:98%;" />
							<div optionKey="keywords" id="keywords_holder" class="ic_smallListHolder"></div>
							<h3>
								<script type="text/javascript">
									document.write(Search_STR.By_Type.LABEL);
								</script>
							</h3>
							<ul id="mediaType_holder">
								<li optionKey="mediaType" optionValue="400" onclick="toggleValue(this)"><a>
									<script type="text/javascript">
										document.write(Search_STR.By_Type.Fields.IMAGE);
									</script>
								</a></li>
								<li optionKey="mediaType" optionValue="401" onclick="toggleValue(this)"><a onclick="">
									<script type="text/javascript">
										document.write(Search_STR.By_Type.Fields.VIDEO);
									</script>
								</a></li>
							</ul>

							<h3>
								<script type="text/javascript">
									document.write(Search_STR.By_Timeframe.LABEL);
								</script>
							</h3>
							<ul id="timeframe_holder">
								<li optionKey="timeframe" optionValue="300" onclick="toggleValue(this)"><a onclick="">
									<script type="text/javascript">
										document.write(Search_STR.By_Timeframe.Fields.PAST_24_HOURS);
									</script>
								</a></li>
								<li optionKey="timeframe" optionValue="301" onclick="toggleValue(this)"><a onclick="">
									<script type="text/javascript">
										document.write(Search_STR.By_Timeframe.Fields.PAST_WEEK);
									</script>
								</a></li>
								<li optionKey="timeframe" optionValue="302" onclick="toggleValue(this)"><a onclick="">
									<script type="text/javascript">
										document.write(Search_STR.By_Timeframe.Fields.PAST_MONTH);
									</script>
								</a></li>
								<li optionKey="timeframe" optionValue="303" onclick="toggleValue(this)"><a onclick="">
									<script type="text/javascript">
										document.write(Search_STR.By_Timeframe.Fields.PAST_YEAR);
									</script>
								</a></li>
								<li optionKey="timeframe" optionValue="304" onclick="toggleValue(this)"><a onclick="">
									<script type="text/javascript">
										document.write(Search_STR.By_Timeframe.Fields.CUSTOM_RANGE);
									</script>
								</a></li>
							</ul>

							<h3>
								<script type="text/javascript">
									document.write(Search_STR.By_Location.LABEL);
								</script>
							</h3>
							<input optionKey="location" id="location"  type="text" class="ic_smallListInput" style="width:65%;" /> <a class="ic_inner_option" onclick="showExpandedViewHolder(ev.map);">
								<script type="text/javascript">
									document.write(Search_STR.By_Location.Fields.MAP);
								</script>
							</a>
							<div optionKey="location" id="location_holder" class="ic_smallListHolder"></div>

						</div>
					</td>
					<td id="search_results_holder" style="visibility:hidden">
						<div id="search_results_info">
							<p>Results: <span id="num_search_results">none</span> found</p>
							<a onclick="Search.prompt();">Save Search</a>
						</div>
						<div id="search_results">

						</div>
					</td>
				</tr>
			</table>
		</div>

	</div>

	<div id="ic_footer">
		<div id="ic_login">
			<p>Hello, <span id="loginDisplayName"></span>!  <a onclick="User.logout();">Logout?</a></p>
			<p>Please log in: <input class="hinted unfocused" hint="username" type="text" id="loginUsername" /> <input type="password" class="hinted ic_password unfocused" hint="password" id="loginPassword" /> <a onclick="User.login();">Go</a></p>
		</div>
	</div>

	</body>
</html>