# Priority workflow activity

`workflow-activity.js` and `workflow-activity.css` provide the same card for a
workflow index or platform home. Load the shared palette and site utilities first.

```js
const activity = IvyWorkflowActivity.select({ reviewItems, runningRuns });
host.innerHTML = IvyWorkflowActivity.render(activity);
host.addEventListener('click', event => {
  const button = event.target.closest('[data-workflow-activity-open]');
  if (button) openRunResults(button.dataset.workflowId, button.dataset.runId);
});
```

Input records contain `workflow: {id,title}`, `run: {id,at,status,progress}`, and
optionally `kind`, `title`, `severity`, `foundAt`, `sourceSystems`, and
`recommendedAction`. A running record's progress contains `step`, `total`, and
`stepName`. Pass only undismissed review items and current running records.

The result slot ranks critical findings, high-severity findings, failed runs,
incomplete runs, other findings, and recommendations. Recency breaks ties. The
active workflow is selected independently and remains visible alongside the
result. When no review items remain, the active workflow can appear alone. No severity
is inferred from counts or workflow names. One sample endpoint finding explicitly
has critical severity to demonstrate the component. Empty input renders nothing.

Call select/render when the surrounding page's data changes. Result navigation is
owned by the host page; the component does not open its own dialog or run work.

Result cards emit `data-workflow-activity-dismiss` with a `data-review-key` equal
 to `run.id + ':' + kind + ':' + title`. The host owns the dismissed-key set and
passes only remaining items back into `select`, which chooses the next result.
Pass `canUndo: true` to `render` to show the heading's Undo dismissal control;
it emits `data-workflow-activity-undo`. Workflows Overview shares these events
with its review-list dismissal state and Undo action.
