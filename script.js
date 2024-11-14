const initialCommentState = {
    username: 'John Doe',
    time: Date.now(),
    text: "Welcome! You can reply to the comments. But you can't delete the initial comment.",
    counter: 1,
    parentCounter: 0,
    comments: {
      '0': {
        username: 'User 1',
        text: 'You can reply nested or delete any comment. You can edit the existing comments.',
        counter: 1,
        parentCounter: 0,
        comments: {
          '0': {
            username: 'User 2',
            text: 'Refresh & see the changes persist. You can reset the comments to the initial state',
            counter: 0,
            parentCounter: 0,
            comments: {},
          },
        },
      },
    },
  };

  // Loading state from localStorage (if exists)
  const storage = localStorage.getItem('state');
  const initialState = storage ? JSON.parse(storage) : JSON.parse(JSON.stringify(initialCommentState));

  const commentContainer = document.querySelector('#commentContainer');
  const commentTemplate = document.querySelector('#comment-template');
  const resetButton = document.querySelector('#reset');
  let rootState;

  function cloneAddCommentTemplate({ username, text }) {
    const commentEl = commentTemplate.content.cloneNode(true);
    commentEl.querySelector('.username').textContent = username;
    commentEl.querySelector('.comment-text').innerText = text;
    commentEl.querySelector('.user-info').classList.remove('hide');
    setDefaultControls(commentEl);
    return commentEl;
  }

  function cloneNewCommentTemplate() {
    const commentEl = commentTemplate.content.cloneNode(true);
    commentEl.querySelector('.username-input').classList.remove('hide');
    setNewCommentControls(commentEl);
    return commentEl;
  }

  function setDefaultControls(commentEl) {
    const commentTextEl = commentEl.querySelector('.comment-text');
    commentTextEl.contentEditable = false;
    commentTextEl.classList.remove('editable');
    commentEl.querySelector('.reply').classList.remove('hide');
    commentEl.querySelector('.delete').classList.remove('hide');
    commentEl.querySelector('.edit').classList.remove('hide');
    commentEl.querySelector('.submit').classList.add('hide');
    commentEl.querySelector('.cancel').classList.add('hide');
  }

  function setEditControls(commentEl) {
    const commentTextEl = commentEl.querySelector('.comment-text');
    commentTextEl.contentEditable = true;
    commentTextEl.classList.add('editable');
    commentTextEl.focus();

    commentEl.querySelector('.reply').classList.add('hide');
    commentEl.querySelector('.delete').classList.add('hide');
    commentEl.querySelector('.edit').classList.add('hide');
    commentEl.querySelector('.submit').classList.remove('hide');
    commentEl.querySelector('.cancel').classList.remove('hide');
  }

  function setNewCommentControls(commentEl) {
    commentEl.querySelector('.comment-text').contentEditable = true;
    commentEl.querySelector('.comment-text').classList.add('editable');
    commentEl.querySelector('.comment-text').focus();

    commentEl.querySelector('.username-input').classList.remove('hide');
    commentEl.querySelector('.cancel').classList.remove('hide');
    commentEl.querySelector('.submit').classList.remove('hide');
  }

  function addComment(parentEl, commentState, parentState) {
    parentEl.querySelector(':scope > .sub-comments').appendChild(
      cloneAddCommentTemplate({
        username: commentState.username,
        text: commentState.text,
      })
    );

    const commentEl = parentEl.querySelector(':scope > .sub-comments > .comment-wrapper:last-child');
    commentEl.querySelector('.profile-pic').src = `https://i.pravatar.cc/32?u=${commentState.username}`;

    commentEl.querySelector('.reply').addEventListener('click', () => {
      if (!commentEl.querySelector(':scope > .sub-comments > .new-comment')) {
        newComment(commentEl, commentState);
      }
    });

    if (!parentState) return commentEl;

    commentEl.querySelector('.delete').addEventListener('click', () => {
      commentEl.remove();
      delete parentState.comments[commentState.parentCounter];
      saveState();
    });

    commentEl.querySelector('.edit').addEventListener('click', () => {
      setEditControls(commentEl);
    });

    commentEl.querySelector('.cancel').addEventListener('click', () => {
      commentEl.querySelector('.comment-text').innerText = commentState.text;
      setDefaultControls(commentEl);
    });

    commentEl.querySelector('.submit').addEventListener('click', () => {
      const innerText = commentEl.querySelector('.comment-text').innerText;
      if (!innerText) return;
      commentState.text = innerText;
      commentEl.querySelector('.comment-text').innerText = innerText;
      setDefaultControls(commentEl);
      saveState();
    });

    return commentEl;
  }

  function newComment(parentEl, parentState) {
    parentEl.querySelector(':scope > .sub-comments').appendChild(cloneNewCommentTemplate());
    const commentEl = parentEl.querySelector(':scope > .sub-comments > .comment-wrapper:last-child');
    commentEl.classList.add('new-comment');

    commentEl.querySelector('.cancel').addEventListener('click', () => {
      commentEl.remove();
    });

    commentEl.querySelector('.submit').addEventListener('click', () => {
      const username = commentEl.querySelector('.username-input').value;
      const text = commentEl.querySelector('.comment-text').innerText;

      if (!username || !text) {
        alert('Please enter both a username and a comment.');
        return;
      }

      const commentState = {
        username: username,
        text: text,
        counter: parentState.counter,
        parentCounter: parentState.counter++,
        comments: {},
      };

      addComment(parentEl, commentState, parentState);
      parentState.comments[parentState.counter++] = commentState;
      commentEl.remove();
      saveState();
    });
  }

  function init(parentEl, parentState) {
    for (const commentState of Object.values(parentState.comments)) {
      const commentEl = addComment(parentEl, commentState, parentState);

      if (commentState.comments) {
        init(commentEl, commentState);
      }
    }
  }

  function loadState(state = initialCommentState) {
    commentContainer.querySelector('.sub-comments').innerHTML = '';
    rootState = state;
    const rootEl = addComment(commentContainer, rootState);
    init(rootEl, rootState);
  }

  function saveState() {
    localStorage.setItem('state', JSON.stringify(rootState));
  }

  resetButton.addEventListener('click', () => loadState(initialCommentState));

  window.addEventListener('beforeunload', saveState);

  loadState(initialState);