application.views.WorkflowDetail = Vue.extend({
	props: ["definitionId", "workflowId"],
	template: "#workflowDetail",
	data: function() {
		return {
			content: null,
			log: null
		}
	},
	activate: function(done) {
		this.load(done);
	},
	methods: {
		load: function(done) {
			var self = this;
			nabu.utils.ajax({
				method: "get",
				url: "/api/workflow/" + this.definitionId + "/instance/" + this.workflowId,
				success: function(response) {
					self.content = JSON.parse(response.responseText);
					if (done) {
						done();
					}
					if (self.content.workflow.transitionState != "SUCCEEDED" || self.content.workflow.transitionState != "FAILED") {
						setTimeout(self.load, 30000);
					}
				}
			});
		}
	},
	filters: {
		formatDate: function(value) {
			return value ? new Date(value).toLocaleString() : null;
		},
		transitionName: function(value) {
			for (var i = 0; i < this.content.definition.states.length; i++) {
				for (var j = 0; j < this.content.definition.states[i].transitions.length; j++) {
					if (this.content.definition.states[i].transitions[j].id == value) {
						return this.content.definition.states[i].transitions[j].name;
					}
				}
			}
			return value;
		}
	}
});