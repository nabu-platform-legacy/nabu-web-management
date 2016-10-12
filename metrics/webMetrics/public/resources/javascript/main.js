var vm = null;

window.addEventListener("load", function() {
	vm = new Vue({
		el: "body",
		data: {
			metricDatabases: [],
			metrics: [],
			visibleCategories: []
		},
		created: function() {
			console.log("LOCAL STORAGE", localStorage);
			var self = this;
			ajax({
				url: "/metrics/list",
				success: function(response) {
					self.metricDatabases = JSON.parse(response.responseText);
				}
			});
		},
		methods: {
			reset: function() {
				this.metrics = [];
				this.visibleCategories = [];
			},
			select: function(database, since) {
				if (since) {
					since = "?since=" + since.toISOString();
				}
				else {
					since = "";
					this.reset();
				}
				var self = this;
				ajax({
					url: "/metrics/list/" + database + since,
					success: function(response) {
						var data = JSON.parse(response.responseText);
						since = new Date(data.overview.timestamp);
						self.pushOverview(data.overview);
						setTimeout(function() {
							self.select(database, since);
						}, 10000);
					}
				});
			},
			toggleCategory: function (category) {
				var index = this.visibleCategories.indexOf(category);
				if (index < 0) {
					this.visibleCategories.push(category);
				}
				else {
					this.visibleCategories.splice(index, 1);
				}
			},
			getArtifactsInCategory: function(category) {
				var artifacts = [];
				for (var i = 0; i < this.metrics.length; i++) {
					if (this.metrics[i].type == category) {
						artifacts.push(this.metrics[i]);
					}
				}
				return artifacts;
			},
			loadStatistics: function(category) {
				var artifacts = this.getArtifactsInCategory(category);
				var statistics = [];
				for (var i = 0; i < artifacts.length; i++) {
					for (var j = 0; j < artifacts[i].series.length; j++) {
						var statistic = {
							id: artifacts[i].id,
							category: artifacts[i].series[j].name,
							cumulativeAverage: artifacts[i].series[j].statistics.cumulativeAverage,
							exponentialAverage: artifacts[i].series[j].statistics.exponentialAverage,
							minimum: artifacts[i].series[j].statistics.minimum,
							maximum: artifacts[i].series[j].statistics.maximum
						};
						for (var k = 0; k < artifacts[i].series[j].statistics.cumulativeAverageDeviation.length; k++) {
							var deviation = artifacts[i].series[j].statistics.cumulativeAverageDeviation[k];
							if (deviation.deviation == 0.25) {
								statistic["deviation25"] = deviation.percentage;
							}
							else if (deviation.deviation == 0.50) {
								statistic["deviation50"] = deviation.percentage;
							}
							else if (deviation.deviation == 0.75) {
								statistic["deviation75"] = deviation.percentage;
							}
							else {
								statistic["deviationRest"] = deviation.percentage;
							}
						}
						statistics.push(statistic);
					}
				}
				var instance = new Statistics({
					data: {
						statistics: statistics
					}
				});
				instance.$mount("#content");
			},
			loadGraphs: function(artifact) {
				var instance = new Graphs({
					data: {
						series: artifact.series,
						id: artifact.id
					}
				});
				instance.$mount("#content");
			},
			pushOverview: function(overview) {
				for (var i = 0; i < overview.metrics.length; i++) {
					var metrics = this.getOverviewById(overview.metrics[i].id);
					// create the metric overview
					if (metrics == null) {
						metrics = {
							id: overview.metrics[i].id
						};
						this.metrics.push(metrics);
					}
					// set the artifact type if it is not known yet
					if (!metrics.type && overview.metrics[i].type) {
						metrics["type"] = overview.metrics[i].type;
					}
					// push the data
					for (var snapshot in overview.metrics[i].snapshots) {
						if (!metrics.series) {
							metrics.series = [];
						}
						var current = null;
						for (var j = 0; j < metrics.series.length; j++) {
							if (metrics.series[j].name == snapshot) {
								current = metrics.series[j];
								break;
							}
						}
						if (current == null) {
							current = {
								name: snapshot,
								values: [],
								statistics: {}
							};
							metrics.series.push(current);
						}
						// push the value data
						for (var j = 0; j < overview.metrics[i].snapshots[snapshot].values.length; j++) {
							current.values.push(overview.metrics[i].snapshots[snapshot].values[j]);
						}
						// push the statistics
						current["statistics"] = overview.metrics[i].statistics[snapshot];
					}
				}
			},
			getOverviewById: function(id) {
				for (var i = 0; i < this.metrics.length; i++) {
					if (this.metrics[i].id == id) {
						return this.metrics[i];
					}
				}
				return null;
			}
		},
		computed: {
			categories: function() {
				var categories = [];
				for (var i = 0; i < this.metrics.length; i++) {
					if (categories.indexOf(this.metrics[i].type) < 0) {
						categories.push(this.metrics[i].type);
					}
				}
				categories.sort();
				return categories;
			}
		}
	});
});


var Statistics = Vue.component("statistics", {
	replace: false,
	props: ["statistics"],
	template: "#statistics",
	data: function() {
		return {
			sortParam: "cumulativeAverage",
			sortOrder: -1
		}
	},
	methods: {
		getCategory: function(category) {
			var statistics = [];
			for (var i = 0; i < this.statistics.length; i++) {
				if (this.statistics[i].category == category) {
					statistics.push(this.statistics[i]);
				}
			}
			return statistics;
		},
		round: function(number) {
			return Math.round(number * 100) / 100;
		}
	},
	computed: {
		categories: function() {
			var categories = [];
			for (var i = 0; i < this.statistics.length; i++) {
				if (categories.indexOf(this.statistics[i].category) < 0) {
					categories.push(this.statistics[i].category);
				}
			}
			return categories;
		}
	}
});

var Graphs = Vue.component("graphs", {
	replace: false,
	props: ["series", "id"],
	template: "#graphs",
	data: function() {
		return {
			series: [],
			id: ""
		}
	},
/*	ready: function() {
		for (var i = 0; i < this.series.length; i++) {
			this.drawGraph(this.series[i]);
		}
	},
	created: function() {
		console.log("CREATED!!");
	},*/
	methods: {
		round: function(number) {
			return Math.round(number * 100) / 100;
		}
	}
});

Vue.directive("graph", {
	bind: function() {
	
	},
	update: function(serie) {
		var labels = [];
		var data = [];
		var cumulativeAverage = [];
		var exponentialAverage = [];
		for (var j = 0; j < serie.values.length; j++) {
			labels.push(new Date(serie.values[j].timestamp).toLocaleTimeString())
			data.push(serie.values[j].value);
			cumulativeAverage.push(serie.statistics.cumulativeAverage);
			exponentialAverage.push(serie.statistics.exponentialAverage);
		}
		if (data.length > 0) {
			var target = document.createElement("div");
			var chart = new Chartist.Line(target, {
				labels: labels,
				series: [
					data,
					cumulativeAverage,
					exponentialAverage
				]
			}, {
				showArea: true,
				axisX: {
					labelInterpolationFnc: function skipLabels(value, index) {
						var result = index % (value.length / 10.0) === 0 ? value : null;
						return isNaN(result) ? null : result;
					}
				},
				showPoint: false,
				fullWidth: true,
	/*			low: 0,*/
				lineSmooth: Chartist.Interpolation.simple({
					divisor: 2
				}),
			});
			this.el.appendChild(target);
		}
	}
});

