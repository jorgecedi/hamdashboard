import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { EmergencyLinkGroup, EmergencyLinkKind } from "../config/types";

type EmergencyLinksSidebarProps = {
  groups: EmergencyLinkGroup[];
  ignoredOutsideClickRefs?: Array<RefObject<HTMLElement | null>>;
  onClose: () => void;
};

const kindLabels: Record<EmergencyLinkKind, string> = {
  official: "Official",
  map: "Map",
  preparedness: "Preparedness",
  community: "Community",
};

export function EmergencyLinksSidebar({ groups, ignoredOutsideClickRefs = [], onClose }: EmergencyLinksSidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);

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

        {groups.length === 0 ? (
          <p className="emergency-links-empty">No emergency resources configured.</p>
        ) : (
          <div className="emergency-link-groups">
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
