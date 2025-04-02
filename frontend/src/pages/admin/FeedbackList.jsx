import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/auth';
import { 
  Card, Button, Form, List, message, Tag, Typography, 
  Spin, Empty, Avatar, Divider, Collapse, Popconfirm 
} from 'antd';
import { 
  CommentOutlined, UserOutlined, ClockCircleOutlined, 
  SendOutlined, DownOutlined, UpOutlined, DeleteOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Custom purple color palette
const colors = {
  primary: '#6200ee',
  secondary: '#bb86fc',
  light: '#f5f0ff',
  border: '#d0bcff',
  text: '#3c366b',
  background: '#fcfaff'
};

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/feedback/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      
      const data = await response.json();
      setFeedbacks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to load feedbacks');
      setLoading(false);
    }
  };

  const handleReplySubmit = async (feedbackId) => {
    if (!replyText.trim()) return message.warning('Please enter a reply');

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}/reply/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (!response.ok) throw new Error('Failed to submit reply');
      
      message.success('Reply submitted');
      setReplyingTo(null);
      setReplyText('');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to submit reply');
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    setDeletingId(feedbackId);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete feedback');
      }

      message.success('Feedback deleted successfully');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      message.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleReplies = (feedbackId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [feedbackId]: !prev[feedbackId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (email) => {
    if (!email || email === 'Anonymous') return 'A';
    return email.split('@')[0].charAt(0).toUpperCase();
  };

  const renderReplyItem = (reply, index) => (
    <List.Item key={index} className="reply-item">
      <div className="reply-content">
        <Avatar size="small" icon={<UserOutlined />} className="reply-avatar" />
        <Text>{reply}</Text>
      </div>
    </List.Item>
  );

  const renderFeedbackCard = (feedback) => (
    <Card key={feedback._id} className="feedback-card">
      <div className="feedback-header">
        <div className="user-info-container">
          <Avatar className="user-avatar">
            {getInitials(feedback.email)}
          </Avatar>
          <div className="user-info">
            <Text strong>{feedback.email || 'Anonymous User'}</Text>
            {feedback.createdAt && (
              <div className="feedback-date">
                <ClockCircleOutlined />
                {formatDate(feedback.createdAt)}
              </div>
            )}
          </div>
        </div>
        
        <div className="feedback-actions">
          {feedback.category && (
            <Tag className="category-tag">{feedback.category}</Tag>
          )}
          <Popconfirm
            title="Are you sure you want to delete this feedback?"
            onConfirm={() => handleDeleteFeedback(feedback._id)}
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              loading={deletingId === feedback._id}
              danger
              className="delete-button"
            />
          </Popconfirm>
        </div>
      </div>

      <Paragraph className="feedback-content">
        {feedback.feedback}
      </Paragraph>

      {feedback.replies?.length > 0 && (
        <div className="replies-section">
          <Divider className="replies-divider">
            <Button 
              type="text" 
              onClick={() => toggleReplies(feedback._id)}
              icon={expandedReplies[feedback._id] ? <UpOutlined /> : <DownOutlined />}
            >
              {feedback.replies.length} {feedback.replies.length === 1 ? 'Reply' : 'Replies'}
            </Button>
          </Divider>

          <Collapse 
            activeKey={expandedReplies[feedback._id] ? 'replies' : null}
            bordered={false}
            className="replies-collapse"
          >
            <Panel key="replies" showArrow={false}>
              <List
                dataSource={feedback.replies}
                renderItem={renderReplyItem}
                className="replies-list"
              />
            </Panel>
          </Collapse>
        </div>
      )}

      <div className="reply-actions">
        <Button 
          type={replyingTo === feedback._id ? "default" : "primary"}
          onClick={() => setReplyingTo(replyingTo === feedback._id ? null : feedback._id)}
        >
          {replyingTo === feedback._id ? 'Cancel' : 'Reply'}
        </Button>
      </div>

      {replyingTo === feedback._id && (
        <div className="reply-form">
          <Form layout="vertical">
            <Form.Item>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
              />
            </Form.Item>
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={() => handleReplySubmit(feedback._id)}
            >
              Submit
            </Button>
          </Form>
        </div>
      )}
    </Card>
  );

  return (
    <div className="feedback-container">
      <Title level={2} className="feedback-header">
        <CommentOutlined /> User Feedback Dashboard
      </Title>
      
      {loading ? (
        <div className="loading-spinner">
          <Spin size="large" />
        </div>
      ) : feedbacks.length === 0 ? (
        <Empty description="No feedback submissions yet" />
      ) : (
        <div className="feedback-list">
          {feedbacks.map(renderFeedbackCard)}
        </div>
      )}

      <style jsx>{`
        .feedback-container {
          background-color: ${colors.background};
          padding: 24px;
          border-radius: 8px;
          min-height: 100vh;
        }
        
        .feedback-header {
          color: ${colors.primary};
          margin-bottom: 24px;
          border-bottom: 2px solid ${colors.border};
          padding-bottom: 12px;
          display: flex;
          align-items: center;
        }
        
        .loading-spinner {
          display: flex;
          justify-content: center;
          padding: 40px;
        }
        
        .feedback-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .feedback-card {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(98, 0, 238, 0.1);
          border-color: ${colors.border};
        }
        
        .feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .user-info-container {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        
        .user-avatar {
          background-color: ${colors.secondary};
          color: white;
        }
        
        .user-info {
          flex: 1;
        }
        
        .feedback-date {
          font-size: 12px;
          color: #666;
        }
        
        .feedback-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .category-tag {
          background-color: ${colors.primary};
          color: white;
        }
        
        .delete-button {
          color: #ff4d4f;
          transition: color 0.3s;
        }
        
        .delete-button:hover {
          color: #ff7875;
        }
        
        .feedback-content {
          background-color: ${colors.light};
          padding: 16px;
          border-radius: 8px;
          border: 1px solid ${colors.border};
          margin-bottom: 16px;
        }
        
        .replies-section {
          margin-bottom: 16px;
        }
        
        .replies-divider {
          margin: 12px 0;
          border-color: ${colors.border};
        }
        
        .replies-collapse :global(.ant-collapse-content) {
          border: none;
          background: transparent;
        }
        
        .reply-item {
          padding: 8px 0;
        }
        
        .reply-content {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .reply-avatar {
          background-color: ${colors.primary};
          color: white;
        }
        
        .reply-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
        }
        
        .reply-form textarea {
          width: 100%;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid ${colors.border};
          resize: vertical;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
};

export default FeedbackList;