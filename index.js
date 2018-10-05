/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {

  const message = (data) => {
    return `${Object.values(data).map((b) => {return `I found the NG word "${b}" from this PR.`}).join('\n')}`
  }

  const catchEvents = [
    'pull_request.opened',
    'pull_request.reopened',
    'pull_request.synchronize'
  ]

  app.on(catchEvents, async context => {

    const config = await context.config(`strindog.yml`);
    const { ng_words } = config || {};
    const diffs = (await context.github.pullRequests.get(context.issue({
      headers: { Accept: 'application/vnd.github.diff' }
    }))).data.split(/\n/)

    let matched = []
    diffs.forEach(diff => {
      if (diff.match(/^\+/)) {
        ng_words.forEach(ng_word => {
          reg = new RegExp(ng_word);
          if (diff.match(reg)) {
            matched.push(ng_word)
          }
        })
      }
    })

    const matchedUnique = matched.filter(function (x, i, self) {
      return self.indexOf(x) === i;
    });

    const comment = message(matchedUnique)
    if (!!comment.trim()) {
      const params = context.issue({ body: comment });
      return context.github.issues.createComment(params);
    }
  })

    // const reviewComment = context.issue({
    //   body: 'Thanks for opening this issue!',
    //   commit_id: '59aac64ace9e3ffdfa88bd4b2cfa2e07d5d5362f',
    //   path: 'README.md',
    //   position: 1
    // })
    // return context.github.pullRequests.createComment(reviewComment)
}