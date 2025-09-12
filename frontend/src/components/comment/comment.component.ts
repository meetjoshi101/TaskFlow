import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment, User } from '../../services/api.models';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  @Input() comment!: Comment;
  @Input() currentUser: User | null = null;
  @Output() commentUpdated = new EventEmitter<{commentId: number, text: string}>();
  @Output() commentDeleted = new EventEmitter<number>();

  isEditing = false;
  editText = '';

  get canEdit(): boolean {
    return this.currentUser ? this.comment.authorId === this.currentUser.id : false;
  }

  get canDelete(): boolean {
    return this.currentUser ? this.comment.authorId === this.currentUser.id : false;
  }

  startEditing(): void {
    if (!this.canEdit) return;
    this.isEditing = true;
    this.editText = this.comment.text;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editText = '';
  }

  saveEdit(): void {
    if (!this.editText.trim()) return;

    this.commentUpdated.emit({
      commentId: this.comment.id,
      text: this.editText.trim()
    });
    this.isEditing = false;
    this.editText = '';
  }

  deleteComment(): void {
    if (!this.canDelete) return;

    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentDeleted.emit(this.comment.id);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}