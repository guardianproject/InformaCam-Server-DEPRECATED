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

import org.apache.commons.codec.digest.DigestUtils;
import org.ektorp.UpdateConflictException;
import org.ektorp.ViewQuery;
import org.ektorp.ViewResult;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.support.DesignDocument;
import org.ektorp.support.DesignDocument.View;
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
		
	public InformaSearch(StdCouchDbConnector db) {
		this.db = db;
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
	
	public ArrayList<JSONObject> query(String viewHash) {
		return CouchParser.getRows(db, new ViewQuery().designDocId("_design/" + viewHash), "call", null);
	}
	
	public ArrayList<JSONObject> query(Map<String, Object> params) {
		ArrayList<JSONObject> result = null;
		Map<String, Object> parameters = parse(params);
		
		StringBuilder query = new StringBuilder();
		int meetsCriteria = 0;
		query.append("function(doc){if(doc._id) {var res = {};var criteriaMet = 0;");
		
		if(parameters.containsKey("location")) {
			query.append(setGeolocate());
			++meetsCriteria;
		}
		
		if(parameters.containsKey("keywords")) {
			query.append(setKeywords((List<String>) parameters.get("keywords")));
			++meetsCriteria;
		}
		
		if(parameters.containsKey("timeframe")) {
			query.append(setTimeframe((Integer) parameters.get("timeframe")));
			++meetsCriteria;
		}
		
		if(parameters.containsKey("mediaType")) {
			query.append(setMediaType((Integer) parameters.get("mediaType")));
			++meetsCriteria;
		}
		
		query.append("var meetsCriteria = " + meetsCriteria + ";");
		query.append("if(meetsCriteria==criteriaMet) {res['_id'] = doc._id; res['mediaType'] = doc.mediaType; res['dateCreated'] = doc.dateCreated; res['sourceId'] = doc.sourceId;emit(doc._id, res);}}}");
		
		InformaTemporaryView itv = new InformaTemporaryView(query.toString(), parameters);
		result = itv.build();
		
		return result;
	}
	
	private String setGeolocate() {
		String template = readTemplate("geolocate.tmpl");
		return "";
		
	}
	
	private String setTimeframe(int timeframe) {
		String template = readTemplate("timeframe.tmpl");
		StringBuffer sb = new StringBuffer();
		
		long upperBound = System.currentTimeMillis();
		long lowerBound = 0L;
		switch(timeframe) {
		case Search.Parameters.Timeframe.PAST_24_HOURS:
			lowerBound = upperBound - getDaysAsMillis(1);
			break;
		case Search.Parameters.Timeframe.PAST_WEEK:
			lowerBound = upperBound - getDaysAsMillis(7);
			break;
		case Search.Parameters.Timeframe.PAST_MONTH:
			lowerBound = upperBound - getDaysAsMillis(30);
			break;
		case Search.Parameters.Timeframe.PAST_YEAR:
			lowerBound = upperBound - getDaysAsMillis(365);
			break;
		}
		
		sb.append("var upperBound = " + upperBound + ";");
		sb.append("var lowerBound = " + lowerBound + ";");
		
		return template.replace(Couch.VAR_SENTINEL, sb.toString());
	}
	
	private static final long getDaysAsMillis(int days) {
		long day = 24 * 60 * 60 * 1000;
		CouchParser.Log(Couch.INFO, "days: " + days + " x day: " + day + " = " + (days * day));
		return (days * day);
	}
	
	private String setMediaType(int mediaType) {
		String template = readTemplate("mediaType.tmpl");
		
		return template.replace(Couch.VAR_SENTINEL, "var mediaType = " + mediaType + ";");
	}
	
	private String setKeywords(List<String> keywords) {
		String template = readTemplate("keywords.tmpl");
		StringBuffer sb = new StringBuffer();
		
		for(String kw : keywords)
			sb.append("," + kw);
		
		return template.replace(Couch.VAR_SENTINEL, "var keywords = [" + sb.toString().substring(1) + "];");
	}
	
	private String readTemplate(String template) {
		StringBuffer sb = new StringBuffer();
		String line;
		int read = 0;
		char[] buf = new char[1024];
		
		try {
			BufferedReader br = new BufferedReader(new FileReader(VIEW_ROOT + template));
			while((read = br.read(buf)) != -1) {
				line = String.valueOf(buf, 0, read);
				sb.append(line);
				buf = new char[1024];
			}
			br.close();
			return sb.toString();
		} catch(IOException e) {
			e.printStackTrace();
			return null;
		}
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
	
	public class InformaTemporaryView  {
		DesignDocument.View view;
		DesignDocument viewDoc;
		String viewQuery, viewHash;
		Map<String, Object> parameters;
				
		public InformaTemporaryView(String viewQuery, Map<String, Object> parameters) {
			this.viewQuery = viewQuery;
			this.parameters = parameters;
			viewHash = DigestUtils.md5Hex(viewQuery);
		}
		
		public ArrayList<JSONObject> build() {
			view = new DesignDocument.View(viewQuery);
			viewDoc = new DesignDocument("_design/" + viewHash);
			viewDoc.addView("call", view);
						
			try {
				db.create(viewDoc);
			} catch(UpdateConflictException e) {
				CouchParser.Log(Couch.DEBUG, "doc already exists");
			}
			
			ArrayList<JSONObject> result = CouchParser.getRows(db, new ViewQuery().designDocId(viewDoc.getId()), "call", null);
			if(result != null && result.size() > 0) {
				if(viewCache == null)
					viewCache = new ArrayList<InformaTemporaryView>();
				
				viewCache.add(this);
			}
			return result;
		}
		
		
		public void save() throws IOException {
			/*
			File viewCache = new File(VIEW_CACHE);
			if(!viewCache.exists())
				viewCache.mkdir();
			
			File viewFile = new File(viewCache, viewHash + ".search");
			FileWriter fw = new FileWriter(viewFile);
			fw.write(view);
			fw.close();
			*/
		}
		
		@SuppressWarnings("unused")
		private void log(Object msg) {
			System.out.println("****************Temp View Builder************: " + String.valueOf(msg));
		}
	}
}
