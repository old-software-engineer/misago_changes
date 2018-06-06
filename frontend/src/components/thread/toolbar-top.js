/* jshint ignore:start */
import React from 'react';
import ReplyButton from './reply-button';
import Subscription from './subscription';
import posting from 'misago/services/posting';
import Ajax from '../../services/ajax';
import Button from "../button";
import snackbar from 'misago/services/snackbar';

export default function (props) {
  var padding = {
    paddingLeft: '0px',
  }
  const hiddenSpecialOption = (!props.thread.acl.can_start_poll || props.thread.poll);
  return (
    <div className="row row-toolbar row-toolbar-bottom-margin">
      <GotoMenu {...props} />
      <div className="col-xs-9 col-md-5 col-md-offset-2">
        <div style={padding} className="row">
          <Spacer visible={!props.user.id} />
          <Spacer visible={hiddenSpecialOption} />
          <SubscriptionMenu {...props} />
          <StartPoll {...props} />
          <Reply {...props} />
          <div style={{ marginTop: 40, }}>
            <Invite threadId={props.thread.id} userId={props.user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GotoMenu(props) {
  const { user } = props;

  let className = 'col-xs-3 col-sm-3 col-md-5';
  if (user.is_anonymous) {
    className = 'col-xs-12 col-sm-3 col-md-5';
  }

  return (
    <div className={className}>
      <div className="row hidden-xs hidden-sm">
        <GotoLast thread={props.thread} />
        <GotoNew thread={props.thread} />
        <GotoBestAnswer thread={props.thread} />
        <GotoUnapproved thread={props.thread} />
      </div>
      <CompactOptions {...props} />
    </div>
  );
}

export function GotoNew(props) {
  if (!props.thread.is_new) return null;

  return (
    <div className="col-sm-4">
      <a
        href={props.thread.url.new_post}
        className="btn btn-default btn-block btn-outline"
        title={gettext('Go to first new post')}
      >
        {gettext("New")}
      </a>
    </div>
  );
}

export function GotoBestAnswer(props) {
  if (!props.thread.best_answer) {
    return null;
  }

  return (
    <div className="col-sm-4">
      <a
        href={props.thread.url.best_answer}
        className="btn btn-default btn-block btn-outline"
        title={gettext('Go to best answer')}
      >
        {gettext("Best answer")}
      </a>
    </div>
  );
}

export function GotoUnapproved(props) {
  if (!props.thread.has_unapproved_posts || !props.thread.acl.can_approve) {
    return null;
  }

  return (
    <div className="col-sm-4">
      <a
        href={props.thread.url.unapproved_post}
        className="btn btn-default btn-block btn-outline"
        title={gettext('Go to first unapproved post')}
      >
        {gettext("Unapproved")}
      </a>
    </div>
  );
}

export function GotoLast(props) {
  return (
    <div className="col-sm-4">
      <a
        href={props.thread.url.last_post}
        className="btn btn-default btn-block btn-outline"
        title={gettext('Go to last post')}
      >
        {gettext("Last")}
      </a>
    </div>
  );
}

export function CompactOptions(props) {
  const { user } = props;
  if (user.is_anonymous) {
    return (
      <div className="visible-xs-block visible-sm-block">
        <a
          href={props.thread.url.last_post}
          className="btn btn-default btn-block btn-outline"
        >
          {gettext("Last post")}
        </a>
      </div>
    );
  }

  return (
    <div className="dropdown visible-xs-block visible-sm-block">
      <button
        aria-expanded="true"
        aria-haspopup="true"
        className="btn btn-default dropdown-toggle btn-block btn-outline"
        data-toggle="dropdown"
        type="button"
      >
        <span className="material-icon">
          expand_more
        </span>
        <span className="btn-text hidden-xs">
          {gettext("Options")}
        </span>
      </button>
      <ul className="dropdown-menu">
        <StartPollCompact {...props} />
        <GotoNewCompact {...props} />
        <GotoUnapprovedCompact {...props} />
        <GotoLastCompact {...props} />
      </ul>
    </div>
  );
}

export function GotoNewCompact(props) {
  if (!props.thread.is_new) return null;

  return (
    <li>
      <a
        href={props.thread.url.new_post}
        className="btn btn-link"
      >
        {gettext("Go to first new post")}
      </a>
    </li>
  );
}

export function GotoUnapprovedCompact(props) {
  if (!props.thread.has_unapproved_posts || !props.thread.acl.can_approve) {
    return null;
  }

  return (
    <li>
      <a
        href={props.thread.url.unapproved_post}
        className="btn btn-link"
      >
        {gettext("Go to first unapproved post")}
      </a>
    </li>
  );
}

export function GotoLastCompact(props) {
  return (
    <li>
      <a
        href={props.thread.url.last_post}
        className="btn btn-link"
      >
        {gettext("Go to last post")}
      </a>
    </li>
  );
}

export function Reply(props) {
  if (!props.thread.acl.can_reply) return null;

  return (
    <div className="col-sm-4 hidden-xs">
      <ReplyButton
        className="btn btn-primary btn-block btn-outline"
        onClick={props.openReplyForm}
      />
    </div>
  );
}

export function SubscriptionMenu(props) {
  if (!props.user.id) return null;

  return (
    <div className="col-xs-12 col-sm-4">
      <Subscription
        className="dropdown"
        dropdownClassName="dropdown-menu dropdown-menu-right stick-to-bottom"
        {...props}
      />
    </div>
  )
}

export class StartPoll extends React.Component {
  onClick = () => {
    posting.open({
      mode: 'POLL',
      submit: this.props.thread.api.poll,

      thread: this.props.thread,
      poll: null
    });
  }

  render() {
    if (!this.props.thread.acl.can_start_poll || this.props.thread.poll) {
      return null;
    }

    return (
      <div className="col-sm-4 hidden-xs">
        <button
          className="btn btn-default btn-block btn-outline"
          onClick={this.onClick}
          type="button"
        >
          <span className="material-icon">
            poll
          </span>
          {gettext("Add poll")}
        </button>
      </div>
    );
  }
}

export class StartPollCompact extends StartPoll {
  render() {
    if (!this.props.thread.acl.can_start_poll || this.props.thread.poll) {
      return null;
    }

    return (
      <li>
        <button
          className="btn btn-link"
          onClick={this.onClick}
          type="button"
        >
          {gettext("Add poll")}
        </button>
      </li>
    );
  }
}

export function Spacer(props) {
  if (!props.visible) return null;

  return (
    <div className="col-sm-4 hidden-xs" />
  );
}


class Invite extends React.Component {
  constructor() {
    super();
    this.state = {
      hasValue: false,
    };
  }
  render() {
    var divStyle = {
      paddingLeft: '17px'
    };
    if (this.state.hasValue) {
      return (
        <div className='hidden-xs' style={divStyle}>
          <input id='email' className='form-control' type='text' placeholder='Enter e-mail address' />
          <button
            style={{
                borderBottomLeftRadius: '5px',
                borderBottomRightRadius: '5px',
                marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, backgroundColor: 'green', width: 130, borderColor: 'green' }}
            className="btn btn-primary btn-outline"
            onClick={() => {
              var value = $("#email").val();
              var values = { 'email': value, 'threadId': this.props.threadId, 'userId': this.props.userId, 'url': location.href };
              $.ajax({
                url: '/api/threads/' + this.props.threadId + '/send_email/' + value + '/' + this.props.userId,
                dataType: "json",
                type: 'get',
                success: function (responseText) {
                  snackbar.success(gettext("E-mail has been sent"));
                },
                error: function (responseText) {
                  snackbar.error(gettext("Error sending E-mail"));
                }
              });
              this.setState({ hasValue: false })
            }}
            type="button">

            {gettext("Send Mail")}
          </button>
            <button
                style={{
                    borderBottomLeftRadius: '5px',
                    borderBottomRightRadius: '5px',
                    borderColor: 'red',
                    marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, backgroundColor: 'red', width: 130, borderColor: 'green' }}
                    className="btn btn-primary btn-outline"
                    onClick={() =>{this.setState({hasValue: false})}}>
                    {gettext('Cancel')}
                </button>
        </div>
      )
    }
    else {
      return (
        <div className='col-sm-4 hidden-xs'>
          <button
            style={{ backgroundColor: 'green', width: 130, borderColor: 'green' }}
            className="btn btn-primary btn-outline"
            onClick={() => { this.setState({ hasValue: true }) }}
            type="button">
            {gettext("Invite")}
          </button>
        </div>
      );
    }
  }
}