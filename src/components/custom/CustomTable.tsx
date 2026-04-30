import React, { useRef, useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  TableContainer,
  Skeleton,
} from "@mui/material";
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";

interface Column {
  key: string;
  label: string;
  renderCell?: (params: any) => React.ReactNode;
}

interface CustomTableProps {
  rows: any[];
  columns: Column[];
  loading?: boolean;
  onLoadMore?: () => Promise<void>;
  maxHeight?: string;

  // onSort: (key: string, order: "asc" | "desc") => void;
}

const CustomTable: React.FC<CustomTableProps> = ({
  rows,
  columns,
  loading,
  onLoadMore,
  maxHeight = "90vh",

  // onSort,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    let newOrder: "asc" | "desc" = "asc";

    if (sortBy === key) {
      newOrder = order === "asc" ? "desc" : "asc";
    }

    setSortBy(key);
    setOrder(newOrder);
    // onSort(key, newOrder);
  };

  useEffect(() => {
    const div = containerRef.current;
    if (!div || !onLoadMore) return;

    const handleScroll = () => {
      const isBottom = div.scrollTop + div.clientHeight >= div.scrollHeight - 50;

      if (isBottom && !loadingRef.current) {
        loadingRef.current = true;
        onLoadMore().finally(() => {
          loadingRef.current = false;
        });
      }
    };

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [onLoadMore]);

  return (
    <Box className="CustomTable">
      <TableContainer
        ref={containerRef}
        sx={{
          maxHeight,
          overflowY: "auto",
          border: "1px solid transparent",
          borderRadius: "8px",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  // onClick={() => handleSort(col.key)}
                  sx={{
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                    padding: "8px 16px",
                    userSelect: "none",
                    fontWeight: "400",
                    color: "var(--textlight)",
                    fontFamily: "DM-Medium !important",
                  }}
                >
                  {col.label}

                  {/* {sortBy === col.key ? (
                    <span style={{ marginLeft: 6 }}>
                    {order === "asc" ? (
                      <IoIosArrowRoundUp style={{ marginLeft: 6, fontSize: 20, color: "var(--textlight)",display:"inline" }} />
                    ) : (
                      <IoIosArrowRoundDown style={{ marginLeft: 6, fontSize: 20, color: "var(--textlight)",display:"inline" }} />
                    )}
                    </span>
                  ) : (
                    <span style={{ marginLeft: 6,visibility:"hidden" }}>
                    {order === "asc" ? (
                      <IoIosArrowRoundUp style={{ marginLeft: 6, fontSize: 20, color: "var(--textlight)",display:"inline" }} />
                    ) : (
                      <IoIosArrowRoundDown style={{ marginLeft: 6, fontSize: 20, color: "var(--textlight)",display:"inline" }} />
                    )}
                    </span>
                  )} */}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      whiteSpace: "nowrap",
                      fontFamily: "DM-Medium !important",
                      fontSize: "12px",
                      padding: "6px 16px",
                      border: "solid 1px var(--greybordertwo)",
                      borderLeft: "solid 0px transparent",
                      borderTop: "solid 0px transparent",
                      color: "var(--text)",
                      "&:last-child": {
                        borderRight: "solid 0px transparent",
                      },
                    }}
                  >
                    {col.renderCell ? col.renderCell(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{
                    textAlign: "center",
                    py: 3,
                    fontFamily: "SemiBold_M",
                    fontSize: "14px",
                    color: "gray",
                  }}
                >
                  No Data Found
                </TableCell>
              </TableRow>
            )}

            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton variant="rectangular" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomTable;
