import { describe, expect, it, vi } from 'vitest';

class FakeElement {
  attributes = new Map<string, string>();
  listeners = new Map<string, Array<() => void>>();
  textContent = '';

  addEventListener(type: string, listener: () => void) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: () => void) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, listeners.filter((entry) => entry !== listener));
  }

  click() {
    for (const listener of this.listeners.get('click') || []) listener();
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) || null;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  hasAttribute(name: string) {
    return this.attributes.has(name);
  }
}

class FakeHTMLElement extends FakeElement {
  nodes = new Map<string, FakeElement>();
  nodeLists = new Map<string, FakeElement[]>();

  querySelector(selector: string) {
    return this.nodes.get(selector) || null;
  }

  querySelectorAll(selector: string) {
    return this.nodeLists.get(selector) || [];
  }
}

describe('experience-toggle', () => {
  it('expands the full timeline when a collapsed summary row is clicked', async () => {
    const registry = new Map<string, typeof FakeHTMLElement>();
    vi.stubGlobal('HTMLElement', FakeHTMLElement);
    vi.stubGlobal('customElements', {
      get: (name: string) => registry.get(name),
      define: (name: string, element: typeof FakeHTMLElement) => registry.set(name, element),
    });

    await import('./experience-toggle.js?summary-click-test');
    const ExperienceToggle = registry.get('experience-toggle');
    expect(ExperienceToggle).toBeDefined();

    const host = new ExperienceToggle!();
    const toggleButton = new FakeElement();
    const summaryRow = new FakeElement();
    const fullTimeline = new FakeElement();
    host.nodes.set('button[data-act="toggle"]', toggleButton);
    host.nodes.set('[data-region="full"]', fullTimeline);
    host.nodeLists.set('[data-act="expand"]', [summaryRow]);

    host.connectedCallback();

    expect(host.hasAttribute('data-expanded')).toBe(false);

    summaryRow.click();

    expect(host.hasAttribute('data-expanded')).toBe(true);
    expect(toggleButton.textContent).toBe('[ − ] COLLAPSE');
    expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
    expect(fullTimeline.getAttribute('aria-hidden')).toBe('false');
  });
});
