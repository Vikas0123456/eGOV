import React from "react";
import { Offcanvas } from "react-bootstrap";
import SimpleBar from "simplebar-react";

const KnowledgeBaseOffcanvas = ({ show, handleClose, knowledgeBaseId }) => {
  const parsedBlocks = knowledgeBaseId ? JSON.parse(knowledgeBaseId.block) : [];

  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      placement="end"
      style={{ width: "80%" }}
    >
      <SimpleBar style={{ maxHeight: 'calc(100vh - 50px)', overflowY: 'auto', overflowX: 'hidden' }}>
        <Offcanvas.Header className="bg-white" closeButton>
          <Offcanvas.Title>View Knowledge Base</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div>
            <p>
              <span
                dangerouslySetInnerHTML={{
                  __html: knowledgeBaseId?.description,
                }}
              ></span>
            </p>

            {parsedBlocks.map((block) => (
              <div key={block.id}>
                {block.type === 'header' && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: block.content,
                    }}
                  ></div>
                )}
                {block.type === 'paragraph' && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: block.content,
                    }}
                  ></div>
                )}
                {block.type === 'image' && (
                  <div className="card"
                    dangerouslySetInnerHTML={{
                      __html: block.content,
                    }}
                  ></div>
                )}
                {block.type === 'video' && (
                  <div className="card"
                    dangerouslySetInnerHTML={{
                      __html: block.content,
                    }}
                  ></div>
                )}
                {block.type === 'code' && <pre>{block.content}</pre>}
                {block.type === 'divider' && <hr />}

              </div>
            ))}
          </div>
        </Offcanvas.Body>
      </SimpleBar>
    </Offcanvas>
  );
};

export default KnowledgeBaseOffcanvas;
