package org.witness.informa;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import net.sf.json.JSONObject;

import org.ektorp.ViewQuery;
import org.ektorp.impl.StdCouchDbConnector;
import org.witness.informa.utils.Constants;
import org.witness.informa.utils.CouchParser;
import org.witness.informa.utils.Constants.Couch;
import org.witness.informa.utils.Constants.Search;
import org.witness.informa.utils.Constants.Couch.Views.TempViews;
import org.witness.informa.utils.Constants.Search.Parameters;
import org.witness.informa.utils.Constants.Search.Parameters.Keywords;
import org.witness.informa.utils.Constants.Search.Parameters.Location;
import org.witness.informa.utils.Constants.Search.Parameters.Timeframe;
import org.witness.informa.utils.Constants.Search.Parameters.Type;

public class InformaSearch implements Constants {
	List<InformaTemporaryView> viewCache;
	StdCouchDbConnector db;
	ViewQuery doc;
		
	public InformaSearch(StdCouchDbConnector db, ViewQuery doc) {
		this.db = db;
		this.doc = doc;
	}
	
	private static Map<String, Object> parse(Map<String, Object> params) {
		Map<String, Object> parsed = new HashMap<String, Object>();
		List<String> kw = null;
		List<Double[]> loc = null;
		
		Iterator<Entry<String, Object>> pIt = params.entrySet().iterator();
		while(pIt.hasNext()) {
			Entry<String, Object> param = pIt.next();
			String value = String.valueOf(param.getValue());
			
			switch(Search.Parameters.KEYS.get(param.getKey())) {
			case Search.Parameters.Keywords.KEY:
				if(kw == null)
					kw = new ArrayList<String>();
				
				String[] keywords = value.subSequence(1, value.length() - 1).toString().split(",");
				for(String k : keywords)
					kw.add(k);
				
				parsed.put(param.getKey(), kw);
				break;
			case Search.Parameters.Type.KEY:
				parsed.put(param.getKey(), Integer.parseInt(value));
				break;
			case Search.Parameters.Timeframe.KEY:
				parsed.put(param.getKey(), Integer.parseInt(value));
				break;
			case Search.Parameters.Location.KEY:
				if(loc == null)
					loc = new ArrayList<Double[]>();
					
				// TODO: parse locations i suppose
				parsed.put(param.getKey(), loc);
				break;
			}
		}
		
		return parsed;
	}
	
	public ArrayList<JSONObject> query(Map<String, Object> params) {
		ArrayList<JSONObject> result = null;
		Map<String, Object> parameters = parse(params);
		
		if(parameters.containsKey("keywords"))
			setKeywords();
		
		if(parameters.containsKey("timeframe"))
			setTimeframe();
		
		if(parameters.containsKey("mediaType"))
			setMediaType();
		
		if(parameters.containsKey("location"))
			setGeolocate();
		
		return result;
	}
	
	private void setGeolocate() {
		Map<String, Object> keyValPair = new HashMap<String, Object>();
		InformaTemporaryView itv = new InformaTemporaryView(TempViews.GEOLOCATE, keyValPair);
	}
	
	private void setTimeframe() {
		
	}
	
	private void setMediaType() {
		
	}
	
	private void setKeywords() {
		
	}
	
	public Map<String, Object> loadSearch(String id) {
		// get the search params from the db
		Map<String, Object> results = null;

		return results;
	}
	
	public boolean saveSearch(String alias, Map<String, Object> params) {
		boolean result = false;
		JSONObject parameters = JSONObject.fromObject(parse(params));
		CouchParser.Log(Couch.INFO, parameters.toString());
		
		// TODO: save for current user, checking to see if alias has been taken!...
		
		return result;
	}
	
	public class InformaSearchResult {
		
	}
	
	public class InformaTemporaryView implements Serializable  {
		private static final long serialVersionUID = -5274860094221733977L;
		private Map<String, Object> keyValPair;
		
		public String view, viewHash;
		
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
