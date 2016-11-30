application.views.WorkflowSearch = Vue.extend({
	template: "#workflowSearch",
	data: function() {
		return {
			workflows: [],
			definitions: [],
			transitionStates: ["RUNNING", "WAITING", "STOPPED", "ERROR", "FAILED", "REVERTED", "SUCCEEDED"],
			search: {
				connectionId: null,
				definitionId: null,
				contextId: null,
				correlationId: null,
				groupId: null,
				workflowType: null,
				limit: 20,
				offset: 0,
				batchId: null,
				environment: null,
				parameters: [],
				transitionState: null,
				stateId: null,
				from: new Date(new Date().getTime() - (1000*60*60*24*7)),
				until: null,
				parentId: null,
				workflowId: null
			}
		};
	},
	activate: function(done) {
		var self = this;
		nabu.utils.ajax({
			method: "get",
			url: "/api/workflow/definition",
			success: function(response) {
				var definitions = JSON.parse(response.responseText);
				nabu.utils.arrays.merge(self.definitions, definitions.workflows);
				self.search.connectionId = self.definitions[0].connectionId;
				done();
			}
		})	
	},
	methods: {
		clear: function() {
			this.search.contextId = null;
			this.search.correlationId = null;
			this.search.groupId = null;
			this.search.workflowType = null;
			this.search.limit = 20;
			this.search.offset = 0;
			this.search.batchId = null;
			this.search.environment = null;
			this.search.parameters = [];
			this.search.transitionState = null;
			this.search.stateId = null;
			this.search.parentId = null;
			this.search.workflowId = null;
			this.get();
		},
		fail: function(workflow) {
			nabu.utils.ajax({
				method: "put",
				url: "/api/workflow/" + workflow.definitionId + "/instance/" + workflow.id,
				data: {
					transitionState: "FAILED"
				},
				success: function(response) {
					workflow.transitionState = "FAILED";
				}
			});
		},
		more: function() {
			this.get(true);
		},
		get: function(nextPage) {
			console.log("requesting!!");
			if (nextPage) {
				this.search.offset += 20;
			}
			else {
				this.search.offset = 0;
				this.search.limit = 20;
			}
			if (this.search.connectionId || this.search.definitionId) {
				var query = "?offset=" + this.search.offset + "&limit=" + this.search.limit;
				if (this.search.definitionId) {
					query += "&definitionId=" + this.search.definitionId;
				}
				else if (this.search.connectionId) {
					query += "&connectionId=" + this.search.connectionId;
				}
				if (this.search.contextId) {
					query += "&contextId=" + this.search.contextId;
				}
				if (this.search.correlationId) {
					query += "&correlationId=" + this.search.correlationId;
				}
				if (this.search.groupId) {
					query += "&groupId=" + this.search.groupId;
				}
				if (this.search.workflowType) {
					query += "&workflowType=" + this.search.workflowType;
				}
				if (this.search.transitionState) {
					query += "&transitionState=" + this.search.transitionState;
				}
				if (this.search.stateId) {
					query += "&stateId=" + this.search.stateId;
				}
				if (this.search.from) {
					query += "&from=" + this.search.from.toISOString();
				}
				if (this.search.until) {
					query += "&until=" + this.search.until.toISOString();
				}
				if (this.search.parentId) {
					query += "&parentId=" + this.search.parentId;
				}
				if (this.search.workflowId) {
					query += "&workflowId=" + this.search.workflowId.trim();
				}
				for (var i = 0; i < this.search.parameters.length; i++) {
					query += "&property=" + this.search.parameters[i].key + "=" + this.search.parameters[i].value;
				}
				var self = this;
				nabu.utils.ajax({
					method: "get",
					url: "/api/workflow/search" + query,
					success: function(response) {
						if (!nextPage) {
							self.workflows.splice(0, self.workflows.length);
						}
						if (response.responseText) {
							var parsed = JSON.parse(response.responseText);
							if (parsed != null && parsed.workflows != null) {
								nabu.utils.arrays.merge(self.workflows, parsed.workflows);	
							}
						}
					}
				});
			}
		}
	},
	computed: {
		connections: function() {
			var connections = [];
			for (var i = 0; i < this.definitions.length; i++) {
				if (this.definitions[i].connectionId && connections.indexOf(this.definitions[i].connectionId) < 0) {
					connections.push(this.definitions[i].connectionId);
				}
			}
			return connections;
		},
		connectionDefinitions: function() {
			var definitions = [];
			for (var i = 0; i < this.definitions.length; i++) {
				if (this.definitions[i].connectionId == this.search.connectionId) {
					definitions.push(this.definitions[i]);
				}
			}
			return definitions;
		},
		states: function() {
			var states = [];
			if (this.search.definitionId != null) {
				for (var i = 0; i < this.definitions.length; i++) {
					if (this.definitions[i].definitionId == this.search.definitionId) {
						nabu.utils.arrays.merge(states, this.definitions[i].states);
					}
				}
			}
			return states;
		}
	}, 
	filters: {
		date: {
			read: function(value) {
				return value ? value.toLocaleDateString() : null;
			},
			write: function(value, oldValue) {
				return value ? new Date(value) : null;
			}
		},
		formatDate: function(value) {
			return value ? new Date(value).toLocaleString() : null;
		},
		state: function(value) {
			for (var i = 0; i < this.definitions.length; i++) {
				for (var j = 0; j < this.definitions[i].states.length; j++) {
					if (this.definitions[i].states[j].id == value) {
						return this.definitions[i].states[j].name;
					}
				}
			}
			return null;
		}
	},
	watch: {
		'search.connectionId': function() {
			this.search.definitionId = null;
			this.get();
		},
		'search.definitionId': function() {
			this.stateId = null;
			this.get();
		},
		'search.contextId': function() {
			this.get();
		},
		'search.correlationId': function() {
			this.get();
		},
		'search.groupId': function() {
			this.get();
		},
		'search.workflowType': function() {
			this.get();
		},
		'search.environment': function() {
			this.get();
		},
		'search.transitionState': function() {
			this.get();
		},
		'search.stateId': function() {
			this.get();
		},
		'search.workflowId': function() {
			this.get();
		},
		'search.until': function() {
			this.get();
		},
		'search.from': function() {
			this.get();
		}
	}
});