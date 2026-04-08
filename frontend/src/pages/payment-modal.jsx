import React from "react";
import Modal from "../components/Modal";
import Button from "../components/Button";

const PaymentModal = ({ open, onClose }) => (
    <Modal open={open} onClose={onClose}>
        <h2 className="text-xl font-bold text-blue-700 mb-4">Pay & Apply</h2>
        <p className="mb-4 text-gray-700">To apply for this job, please complete your payment.</p>
        <Button className="w-full mb-2">Pay with bKash</Button>
        <Button className="w-full mb-2 bg-pink-600 hover:bg-pink-700">Pay with Nagad</Button>
        <Button className="w-full mb-2 bg-green-600 hover:bg-green-700">Pay with Stripe</Button>
        <Button className="w-full mb-2 bg-gray-800 hover:bg-gray-900">Pay with PayPal</Button>
    </Modal>
);

export default PaymentModal;

