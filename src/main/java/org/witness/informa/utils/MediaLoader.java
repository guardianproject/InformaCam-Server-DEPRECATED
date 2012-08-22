package org.witness.informa.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.ExecutionException;

import javax.swing.filechooser.FileFilter;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.ektorp.*;
import org.ektorp.http.HttpClient;
import org.ektorp.http.StdHttpClient;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.impl.StdCouchDbInstance;

import org.witness.informa.utils.Constants.Couch.Views.Derivatives.Geolocate;
import org.witness.informa.utils.Constants.Media.MediaTypes;

public class MediaLoader implements Constants {
	InformaVideo video;
	InformaImage image;
	public InformaSearch search;
	
	public int mediaType = 0;
	
	StdCouchDbConnector dbSources, dbDerivatives;
	ViewQuery docSources, docDerivatives;
	
	public MediaLoader() {
		StdCouchDbInstance db = null;
		try {
			HttpClient couchClient = new StdHttpClient.Builder()
				.url("http://localhost:5984")
				.username(LocalConstants.USERNAME)
				.password(LocalConstants.PASSWORD)
				.build();
			db = new StdCouchDbInstance(couchClient);
		} catch (MalformedURLException e) {
			CouchParser.Log(Couch.ERROR, e.toString());
			e.printStackTrace();
			
		}
		
		
		dbSources = new StdCouchDbConnector("sources", db);
		dbDerivatives = new StdCouchDbConnector("derivatives", db);
		
		docSources = new ViewQuery().designDocId("_design/sources");
		docDerivatives = new ViewQuery().designDocId("_design/derivatives");
				
		search = new InformaSearch(dbDerivatives, docDerivatives);
	}
	
	@SuppressWarnings("unused")
	private void initVideo(String path) throws Exception {
		video = new InformaVideo(path);
		image = null;
	}
	
	@SuppressWarnings("unused")
	private void initImage(String path) throws Exception {
		image = new InformaImage(path);
		video = null;
	}
	
	public ArrayList<JSONObject> getSubmissions() {
		return CouchParser.getRows(dbDerivatives, docDerivatives, Couch.Views.Submissions.GET_BY_MEDIA_TYPE, new String[] {"hashed_pgp"});
	}
	
	public ArrayList<JSONObject> getSources() {
		ArrayList<JSONObject> sourcesList = new ArrayList<JSONObject>();
		
		return sourcesList;
	}
	
	public ArrayList<JSONObject> getSearchResults(Map<String, Object> searchParams) {
		return search.init(searchParams);
	}
	
	public JSONObject loadMedia(String path) {
		JSONObject loadedData = new JSONObject();
		int mimeType = MediaPicker.MapFileType(path.substring(path.lastIndexOf(".")));
		switch(mimeType) {
		case Media.MimeTypes.JPEG:
			image = new InformaImage(path);
			mediaType = MediaTypes.IMAGE;
			loadedData = image.informa;
			break;
		case Media.MimeTypes.MP4:
			try {
				video = new InformaVideo(path);
			} catch (JSONException e) {
				CouchParser.Log(Couch.ERROR, e.toString());
			} catch (InterruptedException e) {
				CouchParser.Log(Couch.ERROR, e.toString());
			} catch (ExecutionException e) {
				CouchParser.Log(Couch.ERROR, e.toString());
			}
			mediaType = MediaTypes.VIDEO;
			break;
		case Media.MimeTypes.MKV:
			try {
				video = new InformaVideo(path);
			} catch (JSONException e) {
				CouchParser.Log(Couch.ERROR, e.toString());
			} catch (InterruptedException e) {
				CouchParser.Log(Couch.ERROR, e.toString());
			} catch (ExecutionException e) {
				CouchParser.Log(Couch.ERROR, e.toString());
			}
			mediaType = MediaTypes.VIDEO;
			loadedData = video.metadata;
			break;
		}
		
		
		return loadedData;
	}
	
	public static ArrayList<String> fileToStrings(File file) throws IOException {
		ArrayList<String> fStrings = new ArrayList<String>();
		FileInputStream fis = new FileInputStream(file);
		BufferedReader br = new BufferedReader(new InputStreamReader(fis, Charset.forName("UTF-8")));
		String line;
		while((line = br.readLine()) != null)
			fStrings.add(line);
		return fStrings;
	}
	
	public static class MediaPicker extends FileFilter implements Constants {
		public MediaPicker() {}

		@Override
		public boolean accept(File file) {
			if(file.isDirectory())
				return true;
			else {
				String path = file.getAbsolutePath().toLowerCase();
				for(int i=0, n = Media.EXTENSIONS.length; i < n; i++) {
					String extension = Media.EXTENSIONS[i];
					if(path.endsWith(extension)) {
						return true;
					}
				}
				return false;
			}
		}

		@Override
		public String getDescription() {
			return UI.Prompt.MEDIA_PICKER;
		}
		
		public static int MapFileType(String extension) {
			int mimeType = -1;
			Iterator<Entry<String, Integer>> i = Media.MIME_TYPES.entrySet().iterator();
			while(i.hasNext()) {
				Entry<String, Integer> e = (Entry<String, Integer>) i.next();
				if(e.getKey().equalsIgnoreCase(extension))
					mimeType = e.getValue();
			}
			return mimeType;
			
		}
	}
}
