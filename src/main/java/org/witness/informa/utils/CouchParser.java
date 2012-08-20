package org.witness.informa.utils;

import java.io.IOException;
import java.lang.StringBuffer;
import java.util.ArrayList;

import org.witness.informa.utils.InformaSearch.InformaTemporaryView;

import sun.util.logging.resources.logging;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import com.fourspaces.couchdb.*;

public class CouchParser implements Constants {
	public interface AdHocViewListener {
		public void viewGenerated(InformaTemporaryView view);
	}
	
	private static String Quotify(String str) {
		return "%22" + str + "%22";
	}
	
	private static String Arrayify(String str) {
		return "%5B" + str + "%5D";
	}
	
	private static ArrayList<JSONObject> getRows(ViewResults vr, String[] removal) {
		ArrayList<JSONObject> result = new ArrayList<JSONObject>();
		JSONArray rows = (JSONArray) vr.get("rows");
		Object[] obj = rows.toArray();
		for(Object o : obj) {
			JSONObject j = (JSONObject) ((JSONObject) o).get("value");
			if(removal != null)
				for(String r : removal)
					j.remove(r);
					
			result.add(j);
		}
		return result;
	}
	
	public static ArrayList<JSONObject> getRows(Database db, Document doc, String view, String[] keys, String[] removal) {
		ArrayList<JSONObject> result = null;
		try {
			View v = doc.getView(view);
			StringBuffer sb = new StringBuffer();
			for(String key : keys)
				sb.append("," + Quotify(key));
			v.setKey(Arrayify(sb.toString().substring(1)));
			
			ViewResults vr = db.view(v);
			if(!vr.isEmpty())
				result = getRows(vr, removal);
		} catch(NullPointerException e) {
			Log(Couch.ERROR, e.toString());
		}
		
		return result;
	}
	
	public static ArrayList<JSONObject> getRows(Database db, Document doc, String view, String key, String[] removal) {
		ArrayList<JSONObject> result = null;
		try {
			View v = doc.getView(view);
			v.setKey(Quotify(key));
			ViewResults vr = db.view(v);
			
			if(!vr.isEmpty())
				result = getRows(vr, removal);
		} catch(NullPointerException e) {
			Log(Couch.ERROR, e.toString());
		}
		
		return result;
	}
	
	public static ArrayList<JSONObject> getRows(Database db, Document doc, String view, String[] removal) {
		ArrayList<JSONObject> result = null;
		try {
			View v = doc.getView(view);			
			ViewResults vr = db.view(v);
			
			if(!vr.isEmpty()) {
				result = getRows(vr, removal);
				
			}
		} catch(NullPointerException e) {
			Log(Couch.ERROR, e.toString());
		}
		
		return result;
	}
	
	public static ArrayList<JSONObject> getRows(InformaSearch search, Database db, InformaTemporaryView tempView, String[] removal) {
		ArrayList<JSONObject> result = null;
		try {
			// create a new view in derivatives/_design/search (if that does not exist)
			ViewResults vr = db.getAllDesignDocuments();
			
			if(!vr.isEmpty()) {
				ArrayList<String> designs = new ArrayList<String>();
				JSONArray rows = (JSONArray) vr.get("rows");
				Object[] obj = rows.toArray();
				for(Object o : obj)
					designs.add(String.valueOf(((JSONObject) o).get("key")));
				
				if(!designs.contains("_design/search")) {
					// add this view
					db.saveDocument(new Document(), "_design/search");
				}
				
				//((AdHocViewListener) search).viewGenerated(tempView);
			}
		} catch(NullPointerException e) {
			Log(Couch.ERROR, e.toString());
			e.printStackTrace();
		} catch (IOException e) {
			Log(Couch.ERROR, e.toString());
			e.printStackTrace();
		}
		
		return result;
	}
	
	public static void Log(String tag, String msg) {
		System.out.println("*********** " + tag + " *************: " + msg);
	}
	
}