<template id="workflowDetail">
	<div class="details">
		<ul>
			<li><span class="key">Definition Id: </span><span class="value">{{ content.workflow.definitionId }}</span></li>
			<li><span class="key">Workflow Id: </span><span class="value">{{ content.workflow.id }}</span></li>
			<li><span class="key">State: </span><span v-bind:class="{ 'bad': content.workflow.transitionState == 'ERROR', 'good': content.workflow.transitionState == 'SUCCEEDED' }" class="value">{{ content.workflow.transitionState }}</span></li>
			<li><span class="key">Started: </span><span class="value">{{ content.workflow.started | formatDate }}</span></li>
			<li><span class="key">Stopped: </span><span class="value">{{ content.workflow.stopped | formatDate }}</span></li>
			<li v-show="content.workflow.parentId != null"><span class="key">Parent Id: </span><span class="value">{{ content.workflow.parentId }}</span></li>
			<li v-show="content.workflow.batchId != null"><span class="key">Batch Id: </span><span class="value">{{ content.workflow.batchId }}</span></li>
			<li v-show="content.workflow.contextId != null"><span class="key">Context Id: </span><span class="value">{{ content.workflow.contextId }}</span></li>
			<li v-show="content.workflow.groupId != null"><span class="key">Group Id: </span><span class="value">{{ content.workflow.groupId }}</span></li>
			<li v-show="content.workflow.correlationId != null"><span class="key">Correlation Id: </span><span class="value">{{ content.workflow.correlationId }}</span></li>
			<li v-show="content.workflow.workflowType != null"><span class="key">Workflow Type: </span><span class="value">{{ content.workflow.workflowType }}</span></li>
			<li v-show="content.workflow.uri != null"><span class="key">Content: </span><a href="/api/workflow/attachment/{{ content.workflow.uri }}" class="value">{{ content.workflow.uri }}</a></li>
			
			<li v-for="property in content.properties"><span class="key">{{ property.key }}: </span><span class="value">{{ property.value }}</span></li>
		</ul>
	</div>
	<table cellspacing="0" cellpadding="0">
		<thead>
			<tr>
				<td>Name</td>
				<td>Started</td>
				<td>Stopped</td>
				<td>State</td>
				<td>Actor</td>
				<td>System</td>
				<td>Batch</td>
				<td>Code</td>
				<td>Error Code</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
			<tr v-for="transition in content.transitions">
				<td>{{ transition.definitionId | transitionName }}</td>
				<td>{{ transition.started | formatDate }}</td>
				<td>{{ transition.stopped | formatDate }}</td>
				<td v-bind:class="{ 'bad': transition.transitionState == 'ERROR' }">{{ transition.transitionState }}</td>
				<td>{{ transition.actorId }}</td>
				<td>{{ transition.systemId }}</td>
				<td>{{ transition.batchId }}</td>
				<td>{{ transition.code }}</td>
				<td>{{ transition.errorCode }}</td>
				<td>
					<a href="javascript:void(0)" v-on:click="log = transition.errorLog" v-show="transition.errorLog"><img src="/resources/images/icons/workflow-errorlog.png"</a>
					<a href="javascript:void(0)" v-on:click="log = transition.log" v-show="transition.log"><img src="/resources/images/icons/workflow-log.png"</a>
					<a href="/api/workflow/attachment/{{ transition.uri }}" v-show="transition.uri"><img src="/resources/images/icons/workflow-attachment.png"</a>
				</td>
			</tr>
		</tbody>
	</table>
	<div class="log" v-show="log != null">
		<pre>{{ log }}</pre>
	</div>
</template>