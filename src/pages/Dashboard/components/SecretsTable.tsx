import { useState } from "react";

interface Secret {
  id: string;
  title: string;
  username: string;
  password: string;
  createdAt: string;
}

interface SecretsTableProps {
  secrets: Secret[];
  onEdit: (secret: Secret) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const SecretsTable = ({
  secrets,
  onEdit,
  onDelete,
  currentPage,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
}: SecretsTableProps) => {
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  const toggleSecretVisibility = (secretId: string) => {
    setVisibleSecrets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(secretId)) {
        newSet.delete(secretId);
      } else {
        newSet.add(secretId);
      }
      return newSet;
    });
  };

  const PaginationControls = () => (
    <div className="flex justify-end items-center gap-4 mt-4 mb-6 px-4 md:px-0">
      <span className="text-sm text-gray-600">Page {currentPage}</span>
      <div className="flex gap-2">
        <button
          onClick={onPrevPage}
          disabled={!hasPrevPage}
          className="px-3 py-1 border rounded cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Previous
        </button>
        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="px-3 py-1 border rounded cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Cards */}
      <div className="md:hidden space-y-4">
        {secrets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 border border-gray-200 text-center text-gray-500">
            No secrets found. Create your first secret to get started.
          </div>
        ) : (
          secrets.map((secret) => (
            <div
              key={secret.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg wrap-break-word pr-2">
                  {secret.title}
                </h3>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onEdit(secret)}
                    className="text-blue-500 text-sm underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(secret.id)}
                    className="text-red-500 text-sm underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">User Key:</span>
                  <p className="font-mono mt-1 break-all">
                    {secret.username || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Secret:</span>
                  <div className="flex items-start gap-2 mt-1">
                    <p className="font-mono break-all flex-1">
                      {visibleSecrets.has(secret.id)
                        ? secret.password
                        : "••••••••"}
                    </p>
                    <button
                      onClick={() => toggleSecretVisibility(secret.id)}
                      className="text-blue-500 text-xs whitespace-nowrap shrink-0"
                    >
                      {visibleSecrets.has(secret.id) ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">
                    Created: {secret.createdAt}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {secrets.length > 0 && <PaginationControls />}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full table-fixed min-w-[800px]">
            <colgroup>
              <col className="w-[25%]" />
              <col className="w-[20%]" />
              <col className="w-[25%]" /> 
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Title/Description
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  User Key
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Secret
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Created
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {secrets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                    No secrets found. Create your first secret to get started.
                  </td>
                </tr>
              ) : (
                secrets.map((secret) => (
                  <tr key={secret.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 align-top">
                      <div className="font-medium wrap-break-word">
                        {secret.title}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="font-mono text-sm break-all">
                        {secret.username || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-sm break-all flex-1">
                          {visibleSecrets.has(secret.id)
                            ? secret.password
                            : "••••••••"}
                        </span>
                        <button
                          onClick={() => toggleSecretVisibility(secret.id)}
                          className="text-blue-500 text-xs hover:underline whitespace-nowrap shrink-0"
                        >
                          {visibleSecrets.has(secret.id) ? "Hide" : "Show"}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 align-top">
                      {secret.createdAt}
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="flex gap-3">
                        <button
                          onClick={() => onEdit(secret)}
                          className="text-blue-500 text-sm underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(secret.id)}
                          className="text-red-500 text-sm underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {secrets.length > 0 && <PaginationControls />}
      </div>
    </>
  );
};

export default SecretsTable;