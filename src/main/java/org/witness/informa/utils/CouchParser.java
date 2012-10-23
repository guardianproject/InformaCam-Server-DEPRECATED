package org.witness.informa.utils;


import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.codehaus.jackson.annotate.JsonProperty;
import org.ektorp.ViewQuery;
import org.ektorp.ViewResult;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.support.CouchDbDocument;

import net.sf.json.JSONObject;

public class CouchParser implements Constants {
	@SuppressWarnings("unused")
	private static String Quotify(String str) {
		return "%22" + str + "%22";
	}
	
	@SuppressWarnings("unused")
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
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static String updateRecord(Class c, StdCouchDbConnector db, String id, String rev, Map<String, Object> updateValues) {
		// ugh i can't believe i had to do this... use reflection to get the function to set the new value!
		List<Method> methods = new ArrayList<Method>();
		
		Object o = db.get(c, id, rev);
		if(o == null)
			return null;
		
		Method[] mtd = o.getClass().getDeclaredMethods();
		for(int m=0; m<mtd.length; m++)
			methods.add(mtd[m]);
		
		Iterator<Entry<String, Object>> uIt = updateValues.entrySet().iterator();
		while(uIt.hasNext()) {
			Entry<String, Object> entry = uIt.next();
			for(Method m : methods) {
				if(m.getName().toLowerCase().contains("set" + entry.getKey().toLowerCase())) {
					try {
						m.invoke(o, entry.getValue());
					} catch (IllegalArgumentException e) {
						Log(Couch.ERROR, e.toString());
						e.printStackTrace();
					} catch (IllegalAccessException e) {
						Log(Couch.ERROR, e.toString());
						e.printStackTrace();
					} catch (InvocationTargetException e) {
						Log(Couch.ERROR, e.toString());
						e.printStackTrace();
					}
				}
			}
		}
		
		((CouchDbDocument) o).setId(id);
		((CouchDbDocument) o).setRevision(rev);
		
		db.update(o);
		return ((CouchDbDocument) o).getRevision();
	}
	
	public static void Log(String tag, String msg) {
		System.out.println("*********** " + tag + " *************: " + msg);
	}
	
	public static boolean validateUser(StdCouchDbConnector db, Map<String, Object> user) {
		ViewQuery doc = new ViewQuery().designDocId(Couch.Design.ADMIN);
		JSONObject u = CouchParser.getRecord(db, doc, Couch.Views.Admin.GET_BY_ID, user.get(DC.Options._ID), null);
		
		if(u == null)
			return false;
		
		if(!u.getString(DC.Options._REV).equals(user.get(DC.Options._REV)))
			return false;
		
		Log(Couch.INFO, "user rev matches");
		return true;
	}
	
	@SuppressWarnings("serial")
	public static class User extends CouchDbDocument {
		@JsonProperty("_id")
		private String _id;
		
		@JsonProperty("_rev")
		private String _rev;
		
		@JsonProperty("displayName")
		private String displayName;
		
		@JsonProperty("savedSearches")
		private List<JSONObject> savedSearches;
		
		@JsonProperty("unpw")
		private String unpw;
		
		@JsonProperty("username")
		private String username;
		
		@JsonProperty("currentSession")
		private String currentSession;
		
		public String getId() {
			return _id;
		}
		
		public void setId(String _id) {
			this._id = _id;
		}
		
		public String getRev() {
			return _rev;
		}
		
		public void setRev(String _rev) {
			this._rev = _rev;
		}

		public String getDisplayName() {
			return displayName;
		}

		public void setDisplayName(String displayName) {
			this.displayName = displayName;
		}

		public List<JSONObject> getSavedSearches() {
			return savedSearches;
		}

		public void setSavedSearches(List<JSONObject> savedSearches) {
			this.savedSearches = savedSearches;
		}

		public String getUnpw() {
			return unpw;
		}

		public void setUnpw(String unpw) {
			this.unpw = unpw;
		}

		public String getUsername() {
			return username;
		}

		public void setUsername(String username) {
			this.username = username;
		}

		public String getCurrentSession() {
			return currentSession;
		}

		public void setCurrentSession(String currentSession) {
			this.currentSession = currentSession;
		}
	}
	
	@SuppressWarnings("serial")
	public static class Derivative extends CouchDbDocument {
		@JsonProperty("_id")
		private String _id;
		
		@JsonProperty("_rev")
		private String _rev;
		
		@JsonProperty("alias")
		private String alias;
		
		@JsonProperty("keywords")
		private List<String> keywords;
		
		@JsonProperty("mediaType")
		private int mediaType;
		
		@JsonProperty("j3m")
		private JSONObject j3m;
		
		@JsonProperty("location")
		private List<double[]> location;
		
		@JsonProperty("locationOnSave")
		private double[] locationOnSave;
		
		@JsonProperty("representation")
		private List<String> representation;
		
		@JsonProperty("sourceId")
		private String sourceId;
		
		@JsonProperty("timestampIndexed")
		private long timestampIndexed;
		
		@JsonProperty("dateCreated")
		private long dateCreated;
		
		@JsonProperty("discussions")
		private List<JSONObject> discussions;
		
		public String getId() {
			return _id;
		}
		
		public void setId(String _id) {
			this._id = _id;
		}
		
		public String getRev() {
			return _rev;
		}
		
		public void setRev(String _rev) {
			this._rev = _rev;
		}
		
		public String getAlias() {
			return alias;
		}
		
		public void setAlias(String alias) {
			this.alias = alias;
		}

		public long getDateCreated() {
			return dateCreated;
		}

		public void setDateCreated(long dateCreated) {
			this.dateCreated = dateCreated;
		}

		public long getTimestampIndexed() {
			return timestampIndexed;
		}

		public void setTimestampIndexed(long timestampIndexed) {
			this.timestampIndexed = timestampIndexed;
		}

		public String getSourceId() {
			return sourceId;
		}

		public void setSourceId(String sourceId) {
			this.sourceId = sourceId;
		}

		public List<String> getKeywords() {
			return keywords;
		}

		public void setKeywords(List<String> keywords) {
			this.keywords = keywords;
		}

		public int getMediaType() {
			return mediaType;
		}

		public void setMediaType(int mediaType) {
			this.mediaType = mediaType;
		}

		public List<String> getRepresentation() {
			return representation;
		}

		public void setRepresentation(List<String> representation) {
			this.representation = representation;
		}

		public double[] getLocationOnSave() {
			return locationOnSave;
		}

		public void setLocationOnSave(double[] locationOnSave) {
			this.locationOnSave = locationOnSave;
		}

		public List<double[]> getLocation() {
			return location;
		}

		public void setLocation(List<double[]> location) {
			this.location = location;
		}

		public JSONObject getJ3m() {
			return j3m;
		}

		public void setJ3m(JSONObject j3m) {
			this.j3m = j3m;
		}

		public List<JSONObject> getDiscussions() {
			return discussions;
		}

		public void setDiscussions(List<JSONObject> discussions) {
			this.discussions = discussions;
		}
	}
	
}