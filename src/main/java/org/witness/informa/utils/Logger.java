package org.witness.informa.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.cometd.bayeux.server.ServerSession;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

public class Logger implements Constants {
	List<Map<String, JSONObject>> log;
	long start_time, end_time;
	
	File log_file;
	
	public Logger(List<ServerSession> list) {
		start_time = System.currentTimeMillis();
		JSONObject init = new JSONObject();
		init.put("init", start_time);
		
		List<JSONObject> active_sessions = new ArrayList<JSONObject>();
		for(ServerSession ss : list) {
			JSONObject session = new JSONObject();
			session.put("id", ss.getId());
			session.put("user_agent", ss.getUserAgent());
			
			active_sessions.add(session);
		}
		init.put("active_sessions", active_sessions);
	}
	
	@SuppressWarnings("unchecked")
	public void log(Map<String, Object> content, String session_id) {
		JSONObject event = new JSONObject();
		event.put("session_id", session_id);
		
		Iterator<Entry<String, Object>> cIt = ((Map<String, Object>) content.get(DC.RESPONSE)).entrySet().iterator();
		while(cIt.hasNext()) {
			Entry<String, Object> entry = cIt.next();
			event.put(entry.getKey(), entry.getValue());
		}
		
		log(event);
	}
	
	public void log(JSONObject e) {
		if(log == null)
			log = new ArrayList<Map<String, JSONObject>>();
		
		long time = System.currentTimeMillis();
		Map<String, JSONObject> event = new HashMap<String, JSONObject>();
		event.put(String.valueOf(time), e);
		
		log.add(event);
		
		System.out.println(event.toString());
		
		if(log.size() >= Log.LOG_MAX)
			close(Log.Termination.MAXIMUM_ENTRIES_REACHED);
	}
	
	public void close(String termination_details) {
		close(termination_details, true);
	}
	
	public void close(String termination_details, boolean restart) {
		end_time = System.currentTimeMillis();
		log_file = new File(LocalConstants.LOG_ROOT, "_" + end_time + ".json");
		JSONObject log_start = new JSONObject();
		log_start.put("start_time", start_time);
		log_start.put("end_time", end_time);
		log_start.put("termination_details", termination_details);
		log_start.put("log", log);
		
		try {
			FileOutputStream fos = new FileOutputStream(log_file);
			fos.write(log_start.toString().getBytes());
			fos.flush();
			fos.close();
			
			log.clear();			
			
			if(restart)
				start_time = end_time;
			else
				log = null;
		} catch(JSONException e) {
			System.out.println(e.toString());
			e.printStackTrace();
		} catch(IOException e) {
			System.out.println(e.toString());
			e.printStackTrace();
		}
	}
}
