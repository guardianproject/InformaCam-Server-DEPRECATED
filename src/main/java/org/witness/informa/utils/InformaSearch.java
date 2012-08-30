package org.witness.informa.utils;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import net.sf.json.JSONObject;

import org.ektorp.ViewQuery;
import org.ektorp.impl.StdCouchDbConnector;
import org.witness.informa.utils.Constants.Couch.Views.TempViews;

public class InformaSearch implements Constants {
	List<InformaTemporaryView> viewCache;
	StdCouchDbConnector db;
	ViewQuery doc;
		
	public InformaSearch(StdCouchDbConnector db, ViewQuery doc) {
		this.db = db;
		this.doc = doc;
	}
	
	public ArrayList<JSONObject> init(Map<String, Object> params) {
		ArrayList<JSONObject> result = null;
		Iterator<Entry<String, Object>> pIt = params.entrySet().iterator();
		while(pIt.hasNext()) {
			Entry<String, Object> param = pIt.next();
			String value = String.valueOf(param.getValue());
			
			switch(Search.Parameters.KEYS.get(param.getKey())) {
			case Search.Parameters.Keywords.KEY:
				
				String[] keywords = value.subSequence(1, value.length() - 1).toString().split(",");
				for(String k : keywords)
					CouchParser.Log("keyword", k);
				
				break;
			case Search.Parameters.Type.KEY:
				int type = Integer.parseInt(value);
				break;
			case Search.Parameters.Timeframe.KEY:
				int timeframe = Integer.parseInt(value);
				break;
			case Search.Parameters.Location.KEY:
				break;
			}
		}
		return result;
	}
	
	public void geolocate(Map<String, Object> keyValPair) {
		InformaTemporaryView itv = new InformaTemporaryView(TempViews.GEOLOCATE, keyValPair);
	}
	
	public class InformaSearchResult {
		
	}
	
	public class InformaTemporaryView implements Serializable  {
		/**
		 * 
		 */
		private static final long serialVersionUID = -5274860094221733977L;
		Map<String, Object> keyValPair;
		String view, viewHash;
		
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
						sb.append("var " + kvp.getKey() + " = " + String.valueOf(kvp.getValue()) + ";");
					}
					
					view = view.replace(Couch.VAR_SENTINEL, sb.toString());
				}
				
				viewHash = CouchParser.hashView(view);
				build();
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			
		}
		
		private void build() {
			ArrayList<JSONObject> results = CouchParser.getRows(InformaSearch.this, db, this, null);
			if(results != null) {
				if(viewCache == null)
					viewCache = new ArrayList<InformaTemporaryView>();
				
				viewCache.add(this);
			}
		}
		
		
		public void save() throws IOException {
			File viewCache = new File(VIEW_CACHE);
			if(!viewCache.exists())
				viewCache.mkdir();
			
			File viewFile = new File(viewCache, viewHash + ".search");
			FileWriter fw = new FileWriter(viewFile);
			fw.write(view);
			fw.close();
		}
		
		@SuppressWarnings("unused")
		private void log(Object msg) {
			System.out.println("****************Temp View Builder************: " + String.valueOf(msg));
		}
	}
}
