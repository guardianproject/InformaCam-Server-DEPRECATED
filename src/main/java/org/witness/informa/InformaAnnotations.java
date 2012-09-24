package org.witness.informa;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import org.ektorp.impl.StdCouchDbConnector;
import org.witness.informa.utils.Constants;
import org.witness.informa.utils.CouchParser;
import org.witness.informa.utils.CouchParser.Derivative;
import org.witness.informa.utils.CouchParser.User;

public class InformaAnnotations implements Constants {
	StdCouchDbConnector db;
	User user;
	Derivative derivative;
	
	public InformaAnnotations(StdCouchDbConnector db) {
		this.db = db;
	}
	
	public void appendAnnotation(Map<String, Object> annotation) {
		parse(annotation);
	}
	
	private static Map<String, Object> parse(Map<String, Object> annotation) {
		Map<String,Object> parsed = new HashMap<String,Object>();
		Iterator<Entry<String, Object>> a = annotation.entrySet().iterator();
		while(a.hasNext()) {
			Entry<String, Object> entry = a.next();
			CouchParser.Log(Couch.INFO, entry.getKey() + " " + entry.getValue());
		}
		
		return parsed;
	}
}
