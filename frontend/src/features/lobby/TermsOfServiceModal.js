import React from "react";
import ReactModal from "react-modal";
import Button from "../../components/basic/Button";

ReactModal.setAppElement("#root");

export const TermsOfServiceModal = ({ 
  isOpen,
  closeModal,
}) => {

  return (
    <ReactModal
      closeTimeoutMS={200}
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Terms of Service"
      overlayClassName="fixed inset-0 bg-black-50 z-50 overflow-y-scroll"
      className="insert-auto text-white p-5 bg-gray-700 border mx-auto my-12 rounded-lg outline-none"
      style={{
        overlay: {
        },
        content: {
          width: '600px',
        }
      }}>

        <h1>Terms of Service</h1>

        <ol>
            <li className="mb-2"><strong>Acceptance of Terms</strong>: By using DragnCards, you agree to these Terms of Service. If you do not agree to these terms, do not use the site.</li>
            <li className="mb-2"><strong>User Accounts</strong>: Users are responsible for maintaining the confidentiality of their account credentials and are liable for all activities that occur under their account.</li>
            <li className="mb-2"><strong>User Content</strong>: Users are responsible for the content they upload and agree not to upload content that infringes upon third-party intellectual property rights.</li>
            <li className="mb-2"><strong>Intellectual Property</strong>: DragnCards does not claim intellectual property rights over user-uploaded content. All game-related assets are owned by their respective creators.</li>
            <li className="mb-2"><strong>Indemnification</strong>: Users agree to indemnify and hold harmless DragnCards and its operators from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses arising from the user's use of and access to the service, or from the infringement of any intellectual property rights.</li>
        </ol>

        <h1>Privacy Policy</h1>

        <ol>
            <li className="mb-2"><strong>Collection of Information</strong>: We collect information provided by users during account creation and game play. This can include username, email, and game-related data.</li>
            <li className="mb-2"><strong>Use of Information</strong>: We use this information to provide and improve our services, respond to user inquiries, and enforce our Terms of Service.</li>
            <li className="mb-2"><strong>Protection of Information</strong>: We implement a variety of security measures to maintain the safety of your personal information.</li>
            <li className="mb-2"><strong>Disclosure of Information</strong>: We do not sell or trade your personal information to outside parties. We may share information when we believe it is necessary to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.</li>
            <li className="mb-2"><strong>Third-Party Links</strong>: Our site may include or offer third-party products or services. These third-party sites have separate and independent privacy policies. We, therefore, have no responsibility or liability for the content and activities of these linked sites.</li>
        </ol>

        <Button isCancel onClick={closeModal} className="mt-2">
          Close
        </Button>

    </ReactModal>
  );
};
