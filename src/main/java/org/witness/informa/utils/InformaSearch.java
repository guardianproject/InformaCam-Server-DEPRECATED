package org.witness.informa.utils;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import net.sf.json.JSONObject;

import org.witness.informa.utils.Constants.Couch.Views.TempViews;
import org.witness.informa.utils.CouchParser.AdHocViewListener;

import com.fourspaces.couchdb.AdHocView;
import com.fourspaces.couchdb.Database;
import com.fourspaces.couchdb.Document;

public class InformaSearch implements AdHocViewListener, Constants {
	List<InformaTemporaryView> viewCache;
	Database db;
	Document doc;
	
	String test;
	
	public InformaSearch(Database db, Document doc) {
		this.db = db;
		this.doc = doc;
		
		test = "function(doc) {if(doc.location) {var queryLat = 40.78;var queryLng = -73.9745873;var radius = 5;" +
				"var R = 6371;var lat = doc.location[0];var lng = doc.location[1];" +
				"var deltaLat = (queryLat-lat) * Math.PI / 180;var deltaLng = (queryLng-lng) * Math.PI / 180;" +
				"var compLat1 = lat * Math.PI / 180;var compLat2 = queryLat * Math.PI / 180;" +
				"var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +Math.sin(deltaLng/2) * Math.sin(deltaLng/2) *" +
				"Math.cos(compLat1) * Math.cos(compLat2);var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));" +
				"var d = R * c;if(d <= radius) {var res = {};res['distance'] = d;" +
				"for(key in doc)res[key] = doc[key];emit(doc._id, res);}}}";

	}
	
	public void geolocate(Map<String, Object> keyValPair) {
		InformaTemporaryView itv = new InformaTemporaryView(TempViews.GEOLOCATE, keyValPair);
	}
	
	public void viewGenerated(InformaTemporaryView view) {
		if(viewCache == null)
			viewCache = new ArrayList<InformaTemporaryView>();
		
		viewCache.add(view);
	}
	
	public class InformaTemporaryView {
		Map<String, Object> keyValPair;
		String view;
		
		public InformaTemporaryView(String template, Map<String, Object> keyValPair) {
			this.keyValPair = keyValPair;
			
			StringBuffer sb = new StringBuffer();
			String line;
			int read = 0;
			char[] buf = new char[1024];
			
			try {
				BufferedReader br = new BufferedReader(new FileReader(template));
				while((read = br.read(buf)) != -1) {
					line = String.valueOf(buf, 0, read);
					sb.append(line);
					buf = new char[1024];
				}
				br.close();
				
				view = sb.toString();
				sb = null;
				
				if(view.contains(Couch.VAR_SENTINEL)) {
					sb = new StringBuffer();
					Iterator<Entry<String, Object>> it = this.keyValPair.entrySet().iterator();
					while(it.hasNext()) {
						Entry<String, Object> kvp = it.next();
						sb.append("var " + kvp.getKey() + " = " + String.valueOf(kvp.getValue()) + ";\n");
					}
					
					view = view.replace(Couch.VAR_SENTINEL, sb.toString());
				}
				
				
				view = test;
				log(view);
				
				build();
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			
		}
		
		private void build() {
			ArrayList<JSONObject> result = CouchParser.getRows(InformaSearch.this, db, this, null);
			
			/*
			for(JSONObject j : result)
				log(j.toString());
			*/
		}
		
		
		public void save() {
			
		}
		
		private void log(String msg) {
			System.out.println("****************Temp View Builder************\n" + msg);
		}
	}
}
