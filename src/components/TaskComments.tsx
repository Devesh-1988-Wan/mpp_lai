import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Edit, Trash2, Reply } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  mentions?: string[];
  attachments?: string[];
}

interface TaskCommentsProps {
  taskId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId: string;
  currentUserName: string;
}

export function TaskComments({
  taskId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUserId,
  currentUserName
}: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const taskComments = comments.filter(comment => comment.taskId === taskId);
  const topLevelComments = taskComments.filter(comment => !comment.parentId);

  const getReplies = (commentId: string) => {
    return taskComments.filter(comment => comment.parentId === commentId);
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment, replyTo || undefined);
      setNewComment('');
      setReplyTo(null);
    }
  };

  const handleEditSubmit = (commentId: string) => {
    if (editContent.trim()) {
      onEditComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const CommentComponent = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-border pl-4' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.authorAvatar} />
          <AvatarFallback>
            {comment.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium">{comment.authorName}</h4>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <Badge variant="outline" className="text-xs">edited</Badge>
            )}
          </div>
          
          {editingComment === comment.id ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                placeholder="Edit your comment..."
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleEditSubmit(comment.id)}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-foreground">
                {comment.content}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(comment.id)}
                    className="h-8 px-2 text-xs"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}
                {comment.authorId === currentUserId && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(comment)}
                      className="h-8 px-2 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteComment(comment.id)}
                      className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {!isReply && getReplies(comment.id).map(reply => (
        <CommentComponent key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Comments ({taskComments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <div className="space-y-3">
          {replyTo && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Reply className="w-4 h-4" />
              <span>Replying to comment</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
                className="h-6 px-2 text-xs"
              >
                Cancel
              </Button>
            </div>
          )}
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[100px]"
          />
          <div className="flex justify-between">
            <div className="text-xs text-muted-foreground">
              Tip: Use @username to mention someone
            </div>
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              <Send className="w-4 h-4 mr-2" />
              {replyTo ? 'Reply' : 'Comment'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {topLevelComments.length > 0 ? (
            topLevelComments.map(comment => (
              <CommentComponent key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}