<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $payments = Payment::where('user_id', $user->id)->get();
        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string|max:255',
            'gateway' => 'required|string|max:50',
            'sandbox' => 'boolean',
        ]);

        $isSandbox = $request->boolean('sandbox', true);
        $status = 'pending';
        $description = $request->description;
        if ($isSandbox) {
            $status = 'success';
            $description .= ' (sandbox transaction)';
        }

        $payment = Payment::create([
            'user_id' => Auth::id(),
            'amount' => $request->amount,
            'description' => $description,
            'status' => $status,
            'gateway' => $request->gateway,
            'sandbox' => $isSandbox,
        ]);

        // Update user balance if payment is successful
        if ($status === 'success') {
            $user = Auth::user();
            $user->balance += $request->amount;
            $user->save();
        }

        return response()->json($payment, 201);
    }

    public function show($id)
    {
        $payment = Payment::where('user_id', Auth::id())->find($id);
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }
        return response()->json($payment);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::where('user_id', Auth::id())->find($id);
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:pending,success,failed',
        ]);

        $payment->status = $request->status;
        $payment->save();

        return response()->json($payment);
    }

    public function destroy($id)
    {
        $payment = Payment::where('user_id', Auth::id())->find($id);
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->delete();

        return response()->json(['message' => 'Payment deleted']);
    }
}
