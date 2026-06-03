import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type {
  CriticalContact,
  EmergencyChecklistItem,
  EmergencyLinkGroup,
  EmergencyLinkKind,
  RadioReference,
} from "../config/types";

type EmergencyLinksSidebarProps = {
  groups: EmergencyLinkGroup[];
  checklist?: EmergencyChecklistItem[];
  contacts?: CriticalContact[];
  radioReferences?: RadioReference[];
  ignoredOutsideClickRefs?: Array<RefObject<HTMLElement | null>>;
  onClose: () => void;
};

const kindLabels: Record<EmergencyLinkKind, string> = {
  official: "Official",
  map: "Map",
  preparedness: "Preparedness",
  community: "Community",
};

export function EmergencyLinksSidebar({
  groups,
  checklist = [],
  contacts = [],
  radioReferences = [],
  ignoredOutsideClickRefs = [],
  onClose,
}: EmergencyLinksSidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const hasResources = groups.length > 0 || checklist.length > 0 || contacts.length > 0 || radioReferences.length > 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (sidebarRef.current?.contains(target)) {
        return;
      }

      if (ignoredOutsideClickRefs.some((ref) => ref.current?.contains(target))) {
        return;
      }

      onClose();
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [ignoredOutsideClickRefs, onClose]);

  return (
    <div className="emergency-links-layer" role="presentation">
      <div className="emergency-links-backdrop" data-testid="emergency-links-backdrop" />
      <aside ref={sidebarRef} id="emergency-links-sidebar" className="emergency-links-sidebar" aria-label="Emergency resources">
        <header className="emergency-links-header">
          <p>Emergency</p>
          <h2>Resources</h2>
          <button className="emergency-links-close" type="button" aria-label="Close emergency links" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        {!hasResources ? (
          <p className="emergency-links-empty">No emergency resources configured.</p>
        ) : (
          <div className="emergency-link-groups">
            {checklist.length > 0 ? (
              <section className="emergency-link-group emergency-reference-section">
                <h3>Offline Checklist</h3>
                <ul className="emergency-checklist">
                  {checklist.map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {contacts.length > 0 ? (
              <section className="emergency-link-group emergency-reference-section">
                <h3>Critical Contacts</h3>
                <div className="critical-contact-list">
                  {contacts.map((contact) => (
                    <article className="critical-contact" key={contact.id}>
                      <span>{contact.label}</span>
                      <strong>{contact.value}</strong>
                      {contact.note ? <small>{contact.note}</small> : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {radioReferences.length > 0 ? (
              <section className="emergency-link-group emergency-reference-section">
                <h3>Radio Reference</h3>
                <div className="radio-reference-list">
                  {radioReferences.map((reference) => (
                    <article className="radio-reference" key={reference.id}>
                      <span>{reference.label}</span>
                      <strong>{reference.frequency}</strong>
                      {reference.note ? <small>{reference.note}</small> : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {groups.map((group) => (
              <section className="emergency-link-group" key={group.id}>
                <h3>{group.title}</h3>
                <div className="emergency-link-list">
                  {group.links.map((link) => (
                    <a className="emergency-link" key={link.id} href={link.url} target="_blank" rel="noreferrer">
                      <span className="emergency-link-label">{link.label}</span>
                      <span className={`emergency-link-kind emergency-link-kind-${link.kind}`}>{kindLabels[link.kind]}</span>
                      <span className="emergency-link-description">{link.description}</span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
