package org.witness.informa.utils;


import java.util.ArrayList;

import org.apache.commons.codec.digest.DigestUtils;
import org.ektorp.UpdateConflictException;
import org.ektorp.ViewQuery;
import org.ektorp.ViewResult;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.support.DesignDocument;
import org.witness.informa.InformaSearch;
import org.witness.informa.InformaSearch.InformaTemporaryView;

import net.sf.json.JSONObject;

public class CouchParser implements Constants {
	private static String Quotify(String str) {
		return "%22" + str + "%22";
	}
	
	private static String Arrayify(String str) {
		return "%5B" + str + "%5D";
	}
	
	public static JSONObject getRecord(StdCouchDbConnector db, ViewQuery doc, String view, Object match, String[] removal) {
		JSONObject result = null;
		doc.viewName(view);
		doc.key(match);
		
		try {
			ViewResult vr = db.queryView(doc);
			result = JSONObject.fromObject(vr.getRows().get(0).getValue());
			if(removal != null) {
				for(String r : removal)
					result.remove(r);
			}
			
		} catch(NullPointerException e) {
			Log(Couch.ERROR, e.toString());
			e.printStackTrace();
		} catch(IndexOutOfBoundsException e) {
			Log(Couch.ERROR, e.toString());
			e.printStackTrace();
		}
		return result;
	}
	
	private static ArrayList<JSONObject> getRows(ViewResult vr, String[] removal) {
		ArrayList<JSONObject> result = new ArrayList<JSONObject>();
		
		for(ViewResult.Row row : vr) {
			JSONObject j = JSONObject.fromObject(row.getValue());
			if(removal != null) {
				for(String r : removal)
					j.remove(r);
			}
			
			result.add(j);
		}
		
		return result;
	}
	
	public static ArrayList<JSONObject> getRows(StdCouchDbConnector db, ViewQuery doc, String view, String[] keys, String[] removal) {
		ArrayList<JSONObject> result = null;
		doc.viewName(view);
		
		try {
			ViewResult vr = db.queryView(doc);
			result = getRows(vr, removal);
			
		} catch(NullPointerException e) {
			Log(Couch.ERROR, e.toString());
			e.printStackTrace();
		}
		
		return result;
	}
	
	public static ArrayList<JSONObject> getRows(StdCouchDbConnector db, ViewQuery doc, String view, String key, String[] removal) {
		ArrayList<JSONObject> result = null;
		doc.viewName(view);
		
		try {
			ViewResult vr = db.queryView(doc);
			result = getRows(vr, removal);
			
		} catch(NullPointerException e) {
			Log(Couch.ERROR, e.toString());
			e.printStackTrace();
		}
		
		return result;
	}
	
	public static ArrayList<JSONObject> getRows(StdCouchDbConnector db, ViewQuery doc, String view, String[] removal) {
		ArrayList<JSONObject> result = null;
		doc.viewName(view);
		
		try {
			ViewResult vr = db.queryView(doc);
			result = getRows(vr, removal);
			
		} catch(NullPointerException e) {
			Log(Couch.ERROR, e.toString());
			e.printStackTrace();
		}
		
		return result;
	}
	
	public static ArrayList<JSONObject> getRows(InformaSearch search, StdCouchDbConnector db, InformaTemporaryView itv, String[] removal) {
		ArrayList<JSONObject> result = null;
		
		DesignDocument.View view = new DesignDocument.View(itv.view);
		DesignDocument doc = new DesignDocument("_design/" + itv.viewHash);
		doc.addView("call", view);
		
		try {
			db.create(doc);
		} catch(UpdateConflictException e) {
			Log(Couch.DEBUG, "doc already exists");
		}
		
		try {
			ViewQuery query = new ViewQuery().designDocId(doc.getId()).viewName("call");
			ViewResult vr = db.queryView(query);
			result = getRows(vr, removal);
		} catch(NullPointerException e) {
			Log(Couch.ERROR, e.toString());
			e.printStackTrace();
		}
		
		return result;
	}
	
	public static String hashView(String view) {
		return DigestUtils.md5Hex(view);
	}
	
	public static void Log(String tag, String msg) {
		System.out.println("*********** " + tag + " *************: " + msg);
	}
	
}