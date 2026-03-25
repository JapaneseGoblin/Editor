import React, { Component } from 'react';
import './NewsAndBlogs.css';
import { CardContent } from './CardContent';

export class SmallCard extends Component {
  render() {
    const { model, onArticleClick } = this.props;
    return (
      <div
        className="card-base card-small"
        style={{ backgroundImage: `url(${model.image})` }}
        onClick={onArticleClick}
      >
        <CardContent model={model} onArticleClick={onArticleClick} />
      </div>
    );
  }
}

export class MediumCard extends Component {
  render() {
    const { model, onArticleClick } = this.props;
    return (
      <div
        className="card-base card-medium"
        style={{ backgroundImage: `url(${model.image})` }}
        onClick={onArticleClick}
      >
        <CardContent model={model} onArticleClick={onArticleClick} />
      </div>
    );
  }
}

export class LargeCard extends Component {
  render() {
    const { model, onArticleClick } = this.props;
    return (
      <div
        className="card-base card-large"
        style={{ backgroundImage: `url(${model.image})` }}
        onClick={onArticleClick}
      >
        <CardContent model={model} onArticleClick={onArticleClick} />
      </div>
    );
  }
}