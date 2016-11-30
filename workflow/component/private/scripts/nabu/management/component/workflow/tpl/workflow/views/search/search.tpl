<template id="workflowSearch">
	<div class="search-menu">
		<div class="primary">
			<select v-model="search.connectionId" class="connectionId">
				<option v-for="connectionId in connections" v-bind:value="connectionId">{{ connectionId }}</option>
			</select>
			<select v-model="search.definitionId" class="definitionId">
				<option v-bind:value="null">-- ALL --</option>
				<option v-for="definition in connectionDefinitions" v-bind:value="definition.definitionId">{{ definition.definitionId }}</option>
			</select>
			<select v-bind:disabled="search.definitionId == null" v-model="search.stateId" class="stateId">
				<option v-bind:value="null">-- ALL --</option>
				<option v-for="state in states" v-bind:value="state.id">{{ state.name }}</option>
			</select>
			<select v-model="search.transitionState" class="transitionState">
				<option v-bind:value="null">-- ALL --</option>
				<option v-for="transitionState in transitionStates" v-bind:value="transitionState">{{ transitionState }}</option>
			</select>
			<input type="text" v-model="search.from | date" placeholder="From" class="from"/>
			<input type="text" v-model="search.to | date" placeholder="Until" class="to"/>
			<input type="text" v-model="search.workflowType" placeholder="Workflow Type" class="id workflowType"/>
			<input type="text" v-model="search.workflowId" placeholder="Workflow Id" class="id workflowId"/>
		</div>
		<div class="secondary">
			<input type="text" v-model="search.correlationId" placeholder="Correlation Id" class="id correlationId"/>
			<input type="text" v-model="search.groupId" placeholder="Group Id" class="id groupId"/>
			<input type="text" v-model="search.contextId" placeholder="Context Id" class="id contextId"/>
			<input type="text" v-model="search.parentId" placeholder="Parent Id" class="id parentId"/>
			<input type="text" v-model="search.batchId" placeholder="Batch Id" class="id batchId"/>
			<input type="text" v-model="search.environment" placeholder="Environment" class="id environment"/>
		</div>
		<div class="actions">
			<button v-on:click="get(false)">Search</button>
		</div>
	</div>
	<div class="search-results">
		<table cellspacing="0" cellpadding="0">
			<thead>
				<tr>
					<td>Workflow</td>
					<td>Started</td>
					<td>Stopped</td>
					<td>State</td>
					<td>Level</td>
					<td>Parent</td>
					<td>Batch</td>
					<td>Type</td>
					<td>Context</td>
					<td>Group</td>
					<td>Correlation</td>
					<td>Environment</td>
					<td>Actions</td>
				</tr>
			</thead>
			<tbody>
				<tr v-for="workflow in workflows">
					<td><a href="javascript:void(0)" v-on:click="search.definitionId = workflow.definitionId">{{ workflow.definitionId }}</a></td>
					<td>{{ workflow.started | formatDate }}</td>
					<td>{{ workflow.stopped | formatDate }}</td>
					<td>{{ workflow.stateId | state }}</td>
					<td v-bind:class="{ 'bad': workflow.transitionState == 'ERROR' }"><a v-bind:class="{ 'bad': workflow.transitionState == 'ERROR' }" href="javascript:void(0)" v-on:click="search.transitionState = workflow.transitionState">{{ workflow.transitionState }}</a></td>
					<td><a href="javascript:void(0)" v-on:click="search.parentId = workflow.parentId">{{ workflow.parentId }}</a></td>
					<td><a href="javascript:void(0)" v-on:click="search.batchId = workflow.batchId">{{ workflow.batchId }}</a></td>
					<td><a href="javascript:void(0)" v-on:click="search.workflowType = workflow.workflowType">{{ workflow.workflowType }}</a></td>
					<td><a href="javascript:void(0)" v-on:click="search.contextId = workflow.contextId">{{ workflow.contextId }}</a></td>
					<td><a href="javascript:void(0)" v-on:click="search.groupId = workflow.groupId">{{ workflow.groupId }}</a></td>
					<td><a href="javascript:void(0)" v-on:click="search.correlationId = workflow.correlationId">{{ workflow.correlationId }}</a></td>
					<td><a href="javascript:void(0)" v-on:click="search.environment = workflow.environment">{{ workflow.environment }}</a></td>
					<td>
						<a title="View Workflow" href="/#/workflow/{{ workflow.definitionId }}/instance/{{ workflow.id }}"><img src="/resources/images/icons/workflow-view.png"/></a>
						<a title="Download Attachment" href="/api/workflow/attachment/{{ workflow.uri }}" v-if="workflow.uri != null"><img src="/resources/images/icons/workflow-attachment.png"/></a>
						<a title="Set to failed" href="javascript:void(0)" v-on:click="fail(workflow)" v-show="workflow.transitionState == 'ERROR'"><img src="/resources/images/icons/failed.png"/></a>
					</td>
				</tr>
			</tbody>
			<tfoot>
				<tr>
					<td colspan="13">
						<button v-on:click="more">Load More</button>
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
</template>