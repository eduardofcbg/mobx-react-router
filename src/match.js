import { reaction } from "mobx";

import { matchPath } from "react-router";

import { RouterStore } from "./store";
import { syncHistoryWithStore } from "./sync";

export class MatchRouter {
  constructor(routes, history, defaultMatchOptions) {
    this._history = history;
    this._routingStore = new RouterStore();
    this._routes = routes;
    this._defaultMatchOptions = defaultMatchOptions;
    this._redirectedPath = undefined;
    this._handleLocationUpdate();
  }

  _handleLocationUpdate() {
    reaction(
      () => this._routingStore.location && this._routingStore.location.pathname,
      (newPath) => this._onChangePath(newPath)
    );
  }

  _onChangePath(fullPath) {
    this._routes.forEach((route) => {
      const matchOptions = route.matchOptions || this._defaultMatchOptions;
      const match = this._matchPath(fullPath, route.path, matchOptions);

      if (match && this._redirected(fullPath)) {
        if (route.onRedirect) return route.onRedirect(match);
        else return;
      }

      if (match && route.onEnter) return route.onEnter(match);
    });
  }

  _matchPath(fullPath, path, matchOptions) {
    const match = matchPath(fullPath, { path: path, ...matchOptions });

    return match && { router: this, ...match };
  }

  _redirected(newPath) {
    return this._redirectedPath == newPath;
  }

  push(path) {
    this._routingStore.push(path);
  }

  replace(path) {
    this._routingStore.replace(path);
  }

  redirect(path) {
    this._redirectedPath = path;
    this.replace(path);
  }

  goBack() {
    this._routingStore.goBack();
  }

  goForward() {
    this._routingStore.goForward();
  }

  get location() {
    return this._routingStore.location;
  }

  get path() {
    return this.location.pathname;
  }

  get history() {
    return syncHistoryWithStore(this._history, this._routingStore);
  }
}
