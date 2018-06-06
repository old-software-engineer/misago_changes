/* jshint ignore:start */
import React from 'react';
import escapeHtml from 'misago/utils/escape-html';
import snackbar from "../../../services/snackbar";

const LAST_POSTER_URL = '<a href="%(url)s" class="poster-title">%(user)s</a>';
const LAST_POSTER_SPAN = '<span class="poster-title">%(user)s</span>';
const LAST_REPLY = '<abbr class="last-title" title="%(absolute)s">%(relative)s</abbr>';

export function Weight(props) {
  if (props.thread.weight == 2) {
    return <li className="thread-pinned-globally">
      <span className="material-icon">
        bookmark
      </span>
      <span className="icon-legend">
        {gettext("Pinned globally")}
      </span>
    </li>;
  } else if (props.thread.weight == 1) {
    return <li className="thread-pinned-locally">
      <span className="material-icon">
        bookmark_border
      </span>
      <span className="icon-legend">
        {gettext("Pinned locally")}
      </span>
    </li>;
  } else {
    return null;
  }
}

export function Unapproved(props) {
  if (props.thread.is_unapproved) {
    return <li className="thread-unapproved">
      <span className="material-icon">
        remove_circle
      </span>
      <span className="icon-legend">
        {gettext("Unapproved")}
      </span>
    </li>;
  } else if (props.thread.has_unapproved_posts) {
    return <li className="thread-unapproved-posts">
      <span className="material-icon">
        remove_circle_outline
      </span>
      <span className="icon-legend">
        {gettext("Unapproved posts")}
      </span>
    </li>;
  } else {
    return null;
  }
}

export function IsHidden(props) {
  if (props.thread.is_hidden) {
    return <li className="thread-hidden">
      <span className="material-icon">
        visibility_off
      </span>
      <span className="icon-legend">
        {gettext("Hidden")}
      </span>
    </li>;
  } else {
    return null;
  }
}

export function IsClosed(props) {
  if (props.thread.is_closed) {
    return <li className="thread-closed">
      <span className="material-icon">
        lock_outline
      </span>
      <span className="icon-legend">
        {gettext("Closed")}
      </span>
    </li>;
  } else {
    return null;
  }
}

export function Replies(props) {
  const message = ngettext("%(replies)s answer", "%(replies)s answers", props.thread.replies);
  const legend = interpolate(message, {'replies': props.thread.replies}, true);

  return <li className="thread-replies">
    <span className="material-icon">
      forum
    </span>
    <span className="icon-legend">
      {legend}
    </span>
  </li>;
}

export function LastReply(props) {
  let user = null;
  if (props.thread.url.last_poster) {
    user = interpolate(LAST_POSTER_URL, {
      url: escapeHtml(props.thread.url.last_poster),
      user: escapeHtml(props.thread.last_poster_name)
    }, true);
  } else {
    user = interpolate(LAST_POSTER_SPAN, {
      user: escapeHtml(props.thread.last_poster_name)
    }, true);
  };

  const date = interpolate(LAST_REPLY, {
    absolute: escapeHtml(props.thread.last_post_on.format('LLL')),
    relative: escapeHtml(props.thread.last_post_on.fromNow())
  }, true);

  const message = interpolate(escapeHtml(gettext("last answer by %(user)s %(date)s")), {
    date, user
  }, true);

  return <li className="thread-last-reply" dangerouslySetInnerHTML={{__html: message}}/>;
}

export function Report(props){
    const threadId = props.thread.thread.id;
    const userId = props.thread.parentProps.user.id;
    return(
      <li style={{cursor: 'pointer'}}>
          <span className='material-icon'>
              flag
          </span>
          <span className='icon-legend'>
              <a className='poster-title' onClick={() => {
                  $.ajax({
              url: '/api/threads/' + threadId + '/report/thread/' +userId,
              dataType: "json",
              type: 'get',
              success: function (responseText) {
                snackbar.success(gettext("Report has been sent."));
              },
              error: function (responseText) {
                snackbar.error(gettext("Error sending report."));
              }
            });
              }}>
                Report
              </a>
          </span>
      </li>
    );
}

class Share extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            hasValue: false,
        };
    }
    render(){
        const threadId = this.props.thread.parentProps.thread.id;
        const userId = this.props.thread.parentProps.user.id;
        if(this.state.hasValue){
            return(
                <li>
                    <span>
                        <input className='form-control' type='email' id='email' placeholder='Enter e-mail address' />
                        <button
                            style={{
                                borderBottomLeftRadius: '5px',
                                borderBottomRightRadius: '5px',
                                marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, backgroundColor: 'green', width: 130, borderColor: 'green' }}
                            onClick={ () => {
                            let value =  $("#email").val();
                            $.ajax({
                                url: '/api/threads/' + threadId + '/send_email/' + value + '/' + userId,
                                dataType: "json",
                                type: 'get',
                                success: function (responseText) {
                                  snackbar.success(gettext("E-mail has been sent"));
                                },
                                error: function (responseText) {
                                  snackbar.error(gettext("Error sending E-mail"));
                                }
                            });
                            this.setState({hasValue: false})
                        }}>
                            Share Post
                        </button>
                        <button
                        style={{
                            borderBottomLeftRadius: '5px',
                            borderBottomRightRadius: '5px',
                            borderColor: 'red',
                            marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, backgroundColor: 'red', width: 130 }}
                            onClick={() => {
                                this.setState({hasValue: false})
                            }}>
                            Cancel
                        </button>
                    </span>
                </li>
            )
        }
        else {
            return(
              <li style={{cursor: "pointer"}}>
                  <span className='material-icon'>
                      share
                  </span>
                  <span className='icon-legend'>
                      <a onClick={() => {
                          this.setState({hasValue: true})
                  }}>
                      Share
                  </a>
                  </span>
              </li>
            );
        }
    }
}


export default function(props) {
  return (
    <div className="header-stats">
      <div className="container">
        <ul className="list-inline">
          <Weight thread={props.thread} />
          <Unapproved thread={props.thread} />
          <IsHidden thread={props.thread} />
          <IsClosed thread={props.thread} />
          <Replies thread={props.thread} />
          <Report thread={props} />
          <Share thread={props} />
          <LastReply thread={props.thread} />
        </ul>
      </div>
    </div>
  );
}
/* jshint ignore:end */