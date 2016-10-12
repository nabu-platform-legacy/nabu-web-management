// version 1.1

/**
 * Set your default handlers in this.variable, currently only "error" and
 * "success" are used
 */
var handlers = {
	error : function(request) {
		if (request.status != 0) {
			alert("Could not fullfill request, the server returned the following error: " + request.status);
		}
	},
	success : function(request) {
		if (request.target) {
			$(request.target).innerHTML = request.responseText;
		}
	}
};

// do not change from here on out

function $(id) {
	return document.getElementById(id);
}

function newXmlHttpRequest() {
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		return new window.XMLHttpRequest();
	}
	else {
		// code for IE6, IE5
		try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e1) {
			try {
				return new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e2) {
				try {
					return new ActiveXObject("Msxml2.XMLHTTP.6.0");
				}
				catch (e3) {
					return new ActiveXObject("Msxml2.XMLHTTP.3.0");
				}
			}
		}
	}
	throw "Could not get request";
}

/**
parameters:
     url: the target
     method: GET, POST,...
     user, pass,
     async (false does not work on firefox 3+?)
     opened: the handler for when the connection is opened
     sent: the handler for when the request is sent
     loading: the handler for when the request is loading
     completed: the handler for when the request is completed
     success: the handler for when completed successfully
     error: the handler for when completed unsuccessfully
     headers: any headers you want to pass along in an associative form
     target: the default "success" handler will see if there is a target, if so, it will put the response directly into that element
     data: the data to be sent to the target (for post requests this should be in the same form as GET: key=value&key2=value2...)
     params: an associative array which acts as data in a post and url parameters in a get
     contentType: the content type of the data
*/
function ajax(parameters) {
	var request = newXmlHttpRequest();

	if (!parameters.url)
		throw "Could not find url";

	if (!parameters.method) {
		parameters.method = "GET";
	}
	else {
		parameters.method = parameters.method.toUpperCase();
	}

	if (parameters.params) {
		var tmp = "";
		for (var key in parameters.params) {
			tmp += (tmp == "" ? "" : "&") + key + "=" + encodeURIComponent(parameters.params[key]);
		}
		// if it's a get or something else with data attached, append them to
		// the url, this assumes no "?"
		if (parameters.method == "GET" || parameters.data) {
			parameters.url += "?" + tmp;
		}
		// otherwise it's data
		else {
			parameters.data = tmp;
		}
	}

	if (!parameters.async) {
		parameters.async = true;
	}

	// apparently opera can not handle "null" being sent, so check
	// note that firefox does not seem to accept "false" (meaning synchronous)
	// communication
	if (parameters.user) {
		request.open(parameters.method.toUpperCase(), parameters.url, parameters.async, parameters.user, parameters.pass);
	}
	else {
		request.open(parameters.method.toUpperCase(), parameters.url, parameters.async);
	}

	if (parameters.headers) {
		for (var key in parameters.headers) {
			request.setRequestHeader(key, parameters.headers[key]);
		}
	}

	if (parameters.target) {
		request.target = parameters.target;
	}

	request.onreadystatechange = function() {
		switch (request.readyState) {
		case 0:
			// not initialized, do nothing
			break;
		// request set up
		case 1:
			if (parameters.opened)
				parameters.opened(request);
			break;
		// request sent
		case 2:
			if (parameters.sent)
				parameters.sent(request);
			break;
		// started loading response
		case 3:
			if (parameters.loading)
				parameters.loading(request);
			break;
		// response loaded
		case 4:
			if (request.status == 200 && parameters.success)
				parameters.success(request);
			else if (request.status == 200 && handlers.success)
				handlers.success(request);
			else if (request.status == 200 && parameters.completed)
				parameters.completed(request);
			else if (parameters.error)
				parameters.error(request);
			else if (parameters.completed)
				parameters.completed(request);
			else
				handlers.error(request);
			break;
		}
	}

//	request.setRequestHeader("Connection", "close");
	request.setRequestHeader("Accept", "application/json, text/html");
	
	// need to add these headers for post
	if (parameters.method == "POST" || parameters.method.toUpperCase() == "PUT" || parameters.method.toUpperCase() == "DELETE") {
		// if we are sending an object as data, jsonify it
		if (parameters.data && typeof(parameters.data) == "object") {
			parameters.data = JSON.stringify(parameters.data);
			parameters.contentType = "application/json";
		}
		request.setRequestHeader("Content-Type", parameters.contentType ? parameters.contentType : "application/x-www-form-urlencoded");
		request.setRequestHeader("Content-Length", parameters.data.length);
	}
	else {
		parameters.data = null;
	}

	request.send(parameters.data ? parameters.data : null);
	return this;
}